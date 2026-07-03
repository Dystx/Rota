import type { CustomLayerInterface, Map as MapLibreMap } from "maplibre-gl";

const LAYER_ID = "spatial-engine:atmosphere:radial-gradient";
export const RADIAL_GRADIENT_ATMOSPHERE_LAYER_ID = LAYER_ID;

export interface RadialGradientAtmosphereOptions {
  /** Color at the centre of the gradient (the brightest pixel). */
  innerColor?: string;
  /** Color at the edge of the gradient — typically matches the deep-space backdrop. */
  outerColor?: string;
  /** Overall alpha multiplier in [0, 1]. Default: 0.6. */
  intensity?: number;
  /** How far the gradient extends as a fraction of the viewport min-dimension (0-1). Default: 0.7. */
  radius?: number;
  /** Set to true to skip adding the layer entirely. Default: false. */
  disabled?: boolean;
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform vec3 u_inner_color;
uniform vec3 u_outer_color;
uniform float u_intensity;
uniform float u_radius;
void main() {
  vec2 centered = v_uv - vec2(0.5);
  float dist = length(centered);
  // Soft Gaussian-ish falloff; pow > 1 concentrates the energy at the centre.
  float alpha = pow(1.0 - clamp(dist / u_radius, 0.0, 1.0), 2.5) * u_intensity;
  // Mix inner → outer color so the edge of the gradient fades into the
  // configured backdrop rather than the inner color bleeding to the edge.
  vec3 rgb = mix(u_inner_color, u_outer_color, clamp(dist / u_radius, 0.0, 1.0));
  // PREMULTIPLIED ALPHA — MapLibre sets blendFunc(ONE, ONE_MINUS_SRC_ALPHA),
  // so the colour channels must already be multiplied by alpha. Without this
  // the halo looks washed-out / chalky.
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`;

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.error("[spatial-engine] shader compile error", gl.getShaderInfoLog(shader), source);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  // Shaders can be detached and deleted once the program is linked.
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.error("[spatial-engine] program link error", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Parse `rgb(r, g, b)` / `rgba(r, g, b, a)` / `#rrggbb` / `#rgb` into [0,1] floats. */
function parseCssColor(input: string): [number, number, number] {
  const trimmed = input.trim();
  const rgbMatch = trimmed.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i);
  if (rgbMatch) {
    return [
      Number(rgbMatch[1]) / 255,
      Number(rgbMatch[2]) / 255,
      Number(rgbMatch[3]) / 255
    ];
  }
  let hex = trimmed.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255
    ];
  }
  return [0, 0, 0];
}

/**
 * RadialGradientAtmosphereLayer — a 2D `CustomLayerInterface` that draws a
 * soft radial gradient over the MapLibre canvas. Used for the "softer halo"
 * the MapTiler SDK exposes via its RadialGradientLayer.
 *
 * The shader output uses **premultiplied alpha** (`vec4(rgb * a, a)`) because
 * MapLibre's custom layer blend function is `gl.blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`.
 * Without premultiplied alpha the halo looks washed out / chalky.
 *
 * Render mode: `2d` (a fullscreen quad with no depth test).
 * Render order: layered on top of the basemap by id (the id sorts after the
 * default `background` / `water` / `land` basemap layer ids alphabetically).
 */
export class RadialGradientAtmosphereLayer implements CustomLayerInterface {
  readonly id = LAYER_ID;
  readonly type = "custom" as const;
  readonly renderingMode = "2d" as const;

  private readonly options: Required<RadialGradientAtmosphereOptions>;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private aPos: number = -1;
  private uInnerColor: WebGLUniformLocation | null = null;
  private uOuterColor: WebGLUniformLocation | null = null;
  private uIntensity: WebGLUniformLocation | null = null;
  private uRadius: WebGLUniformLocation | null = null;

  constructor(options: RadialGradientAtmosphereOptions = {}) {
    this.options = {
      innerColor: options.innerColor ?? "rgb(60, 90, 120)",
      outerColor: options.outerColor ?? "rgb(5, 8, 15)",
      intensity: options.intensity ?? 0.6,
      radius: options.radius ?? 0.7,
      disabled: options.disabled ?? false
    };
  }

  /** The `CustomLayerInterface` spec to pass to `map.addLayer(...)`. */
  get layerSpec(): CustomLayerInterface {
    return this;
  }

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    void map;
    this.gl = gl;
    const program = linkProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) return;
    this.program = program;

    this.aPos = gl.getAttribLocation(program, "a_pos");
    this.uInnerColor = gl.getUniformLocation(program, "u_inner_color");
    this.uOuterColor = gl.getUniformLocation(program, "u_outer_color");
    this.uIntensity = gl.getUniformLocation(program, "u_intensity");
    this.uRadius = gl.getUniformLocation(program, "u_radius");

    // Fullscreen triangle / quad as two triangles in NDC: (-1,-1) → (+1,+1).
    const buffer = gl.createBuffer();
    if (!buffer) return;
    this.quadBuffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
  }

  render(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (!this.program || !this.quadBuffer) return;
    const [rIn, gIn, bIn] = parseCssColor(this.options.innerColor);
    const [rOut, gOut, bOut] = parseCssColor(this.options.outerColor);

    gl.useProgram(this.program);

    // MapLibre already sets blendFunc(ONE, ONE_MINUS_SRC_ALPHA) for custom
    // layers, but we re-assert it here so the layer is correct even if a
    // future MapLibre change relaxes the default. The shader output is in
    // premultiplied alpha form to match.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // No depth test/write — this is a fullscreen 2D overlay.
    gl.disable(gl.DEPTH_TEST);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3f(this.uInnerColor, rIn, gIn, bIn);
    gl.uniform3f(this.uOuterColor, rOut, gOut, bOut);
    gl.uniform1f(this.uIntensity, this.options.intensity);
    gl.uniform1f(this.uRadius, this.options.radius);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disableVertexAttribArray(this.aPos);
  }

  onRemove(_map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
    if (this.program) gl.deleteProgram(this.program);
    this.quadBuffer = null;
    this.program = null;
    this.gl = null;
  }
}