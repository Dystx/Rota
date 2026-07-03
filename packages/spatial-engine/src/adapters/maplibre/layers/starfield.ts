import type {
  CustomLayerInterface,
  CustomRenderMethodInput,
  Map as MapLibreMap
} from "maplibre-gl";

const LAYER_ID = "spatial-engine:atmosphere:starfield";
export const STARFIELD_LAYER_ID = LAYER_ID;

export interface StarfieldOptions {
  /** Number of stars distributed on the unit sphere. Default: 26000. */
  count?: number;
  /** Minimum per-star brightness in [0, 1]. Default: 0.3. */
  minBrightness?: number;
  /** Maximum per-star brightness in [0, 1]. Default: 1.0. */
  maxBrightness?: number;
  /**
   * Reserved for downstream PRNGs. Today the positions use a deterministic
   * Fibonacci spiral so the seed has no visible effect — kept on the
   * options bag for forward-compatibility with a randomised variant.
   */
  seed?: number;
  /** Set to true to skip adding the layer entirely. Default: false. */
  disabled?: boolean;
}

const VERTEX_SHADER = `
attribute vec3 a_pos;
attribute float a_brightness;
uniform mat4 u_matrix;
varying float v_brightness;
void main() {
  vec4 pos = u_matrix * vec4(a_pos, 1.0);
  gl_Position = pos;
  // Bigger when nearer (smaller |pos.z|), smaller when farther. The 300.0
  // multiplier is a unit-scaling knob tuned for the typical MapLibre zoom
  // range used on the discovery globe.
  gl_PointSize = a_brightness * (300.0 / max(-pos.z, 0.001));
  v_brightness = a_brightness;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_brightness;
void main() {
  // Round the point sprite and soft-falloff the edge.
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d);
  if (r > 0.5) discard;
  float a = (1.0 - r * 2.0) * v_brightness;
  // PREMULTIPLIED ALPHA — MapLibre custom layers use blendFunc(ONE,
  // ONE_MINUS_SRC_ALPHA), so multiply the colour channels by alpha here.
  gl_FragColor = vec4(vec3(1.0) * a, a);
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

/**
 * Fibonacci sphere — distribute N points on a unit sphere with constant
 * surface density and no clustering at the poles. Returns interleaved
 * `[x, y, z, brightness, ...]` floats ready for upload as a VBO.
 */
function buildStarfieldAttributes(
  count: number,
  minBrightness: number,
  maxBrightness: number
): Float32Array {
  const data = new Float32Array(count * 4);
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle in radians
  const range = maxBrightness - minBrightness;
  for (let i = 0; i < count; i++) {
    // y goes 1 → -1 across the sphere; theta is the azimuth.
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    const brightness = minBrightness + range * ((i * 2654435761) % 1000) / 1000;
    const base = i * 4;
    data[base + 0] = x;
    data[base + 1] = y;
    data[base + 2] = z;
    data[base + 3] = brightness;
  }
  return data;
}

/**
 * StarfieldLayer — a 3D `CustomLayerInterface` that draws ~26k fixed
 * star points distributed on a unit sphere using the Fibonacci spiral.
 *
 * Stars are projected by the `matrix` MapLibre passes to `render`, so they
 * stay anchored to their sky positions as the user pans / rotates the globe.
 * `renderingMode: "3d"` means the layer participates in the depth buffer:
 * the globe's geometry writes depth and any star whose projected position
 * falls behind the planet is automatically occluded by the depth test.
 *
 * Fragment output uses **premultiplied alpha** to match MapLibre's
 * `gl.blendFunc(ONE, ONE_MINUS_SRC_ALPHA)` custom-layer blend mode.
 */
export class StarfieldLayer implements CustomLayerInterface {
  readonly id = LAYER_ID;
  readonly type = "custom" as const;
  readonly renderingMode = "3d" as const;

  private readonly options: Required<StarfieldOptions>;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private starsBuffer: WebGLBuffer | null = null;
  private count = 0;
  private aPos = -1;
  private aBrightness = -1;
  private uMatrix: WebGLUniformLocation | null = null;

  constructor(options: StarfieldOptions = {}) {
    this.options = {
      count: options.count ?? 26000,
      minBrightness: options.minBrightness ?? 0.3,
      maxBrightness: options.maxBrightness ?? 1.0,
      seed: options.seed ?? 1,
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
    this.aBrightness = gl.getAttribLocation(program, "a_brightness");
    this.uMatrix = gl.getUniformLocation(program, "u_matrix");

    const attrs = buildStarfieldAttributes(
      this.options.count,
      this.options.minBrightness,
      this.options.maxBrightness
    );
    this.count = this.options.count;
    const buffer = gl.createBuffer();
    if (!buffer) return;
    this.starsBuffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, attrs, gl.STATIC_DRAW);
  }

  render(gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput): void {
    if (!this.program || !this.starsBuffer || this.count === 0) return;

    gl.useProgram(this.program);

    // Premultiplied alpha: MapLibre sets this for us, but assert it so a
    // future renderer change can't regress the blending.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Stars participate in the depth buffer (renderingMode: "3d") so the
    // globe's depth occludes stars behind the planet.
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false); // we don't write depth — only test against the globe

    // MapLibre hands us a `mat4` (gl-matrix tuple). It is laid out in the
    // same column-major 16-float form that uniformMatrix4fv expects, so a
    // plain Float32Array view of the values works for the upload. Cast via
    // `any` here because `gl-matrix` `mat4` is a 16-element number tuple
    // that the TS DOM lib types as incompatible with Float32Array even
    // though the underlying memory layout is identical.
    const matrix = args.modelViewProjectionMatrix as unknown as Float32Array;
    gl.uniformMatrix4fv(this.uMatrix, false, matrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.starsBuffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.aBrightness);
    gl.vertexAttribPointer(this.aBrightness, 1, gl.FLOAT, false, 16, 12);

    gl.drawArrays(gl.POINTS, 0, this.count);

    gl.disableVertexAttribArray(this.aPos);
    gl.disableVertexAttribArray(this.aBrightness);
    gl.depthMask(true);
  }

  onRemove(_map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.starsBuffer) gl.deleteBuffer(this.starsBuffer);
    if (this.program) gl.deleteProgram(this.program);
    this.starsBuffer = null;
    this.program = null;
    this.gl = null;
  }
}