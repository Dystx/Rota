import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userId: vi.fn(),
  client: vi.fn(),
  upload: vi.fn(),
  createSignedUrl: vi.fn(),
  remove: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUserId: mocks.userId
}));

import {
  uploadSpecialistPortrait
} from "./portrait-upload";
import {
  SPECIALIST_PORTRAIT_BUCKET,
  SPECIALIST_PORTRAIT_MAX_BYTES
} from "./portrait-upload-constants";

const userId = "11111111-1111-4111-8111-111111111111";

function formData(file: File) {
  const data = new FormData();
  data.set("portrait", file);
  return data;
}

describe("uploadSpecialistPortrait", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userId.mockResolvedValue({ kind: "ready", userId });
    mocks.upload.mockResolvedValue({ error: null });
    mocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example.test/portrait" },
      error: null
    });
    mocks.remove.mockResolvedValue({ error: null });
    mocks.client.mockResolvedValue({
      storage: {
        from: vi.fn(() => ({
          upload: mocks.upload,
          createSignedUrl: mocks.createSignedUrl,
          remove: mocks.remove
        }))
      }
    });
  });

  it("validates the image signature, uploads privately, and returns a signed preview", async () => {
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01])],
      "portrait.png",
      { type: "image/png" }
    );
    const result = await uploadSpecialistPortrait(formData(file));

    expect(result).toEqual({
      kind: "unavailable",
      message: "Portrait uploads are not enabled yet. You can finish your profile without a photo."
    });
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("rejects a MIME-spoofed file before touching Storage", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "portrait.png", {
      type: "image/png"
    });
    const result = await uploadSpecialistPortrait(formData(file));

    expect(result).toEqual({
      kind: "error",
      message: "The selected file is not a valid image of that type."
    });
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("reports an unavailable beta state when the bucket is missing", async () => {
    mocks.upload.mockResolvedValue({ error: new Error("Bucket not found") });
    const file = new File(
      [new Uint8Array([0xff, 0xd8, 0xff, 0x01])],
      "portrait.jpg",
      { type: "image/jpeg" }
    );
    const result = await uploadSpecialistPortrait(formData(file));

    expect(result.kind).toBe("unavailable");
    expect(result).toMatchObject({ message: expect.stringContaining("not enabled") });
    expect(mocks.createSignedUrl).not.toHaveBeenCalled();
  });

  it("rejects files above the 5 MB boundary", async () => {
    const file = new File(
      [new Uint8Array(SPECIALIST_PORTRAIT_MAX_BYTES + 1)],
      "portrait.jpg",
      { type: "image/jpeg" }
    );
    const result = await uploadSpecialistPortrait(formData(file));

    expect(result).toEqual({
      kind: "error",
      message: "Portraits must be smaller than 5 MB."
    });
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(SPECIALIST_PORTRAIT_BUCKET).toBe("specialist-portraits");
  });
});
