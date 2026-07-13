"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/current-user";
import {
  SPECIALIST_PORTRAIT_MAX_BYTES
} from "./portrait-upload-constants";

/**
 * Private object storage for specialist profile portraits remains gated until
 * the R2 media configuration is enabled.
 *
 * Objects are always written below `<auth user id>/...`. The matching
 * storage policies enforce that prefix for reads and writes as a second
 * authorization boundary; this action never accepts a caller-provided path.
 */
const ACCEPTED_TYPES = {
  "image/jpeg": { extension: "jpg" as const, signature: [0xff, 0xd8, 0xff] },
  "image/png": {
    extension: "png" as const,
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  },
  "image/webp": { extension: "webp" as const, signature: [0x52, 0x49, 0x46, 0x46] }
} as const;

const portraitUploadSchema = z.object({
  file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File)
});

export type PortraitUploadResult =
  | { kind: "ok"; path: string; signedUrl: string }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

function startsWithSignature(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function hasWebpSignature(bytes: Uint8Array) {
  return startsWithSignature(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWithSignature(bytes.slice(8, 12), [0x57, 0x45, 0x42, 0x50]);
}

function validatePortraitFile(file: File): string | null {
  const metadata = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES];
  if (!metadata) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size <= 0 || file.size > SPECIALIST_PORTRAIT_MAX_BYTES) {
    return "Portraits must be smaller than 5 MB.";
  }
  return null;
}

async function validatePortraitBytes(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const metadata = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES];
  if (!metadata) return "Choose a JPEG, PNG, or WebP image.";
  const matches = file.type === "image/webp"
    ? hasWebpSignature(bytes)
    : startsWithSignature(bytes, metadata.signature);
  return matches ? null : "The selected file is not a valid image of that type.";
}

/**
 * Upload one portrait for the signed-in specialist and return a short-lived
 * preview URL. A missing bucket/configuration is reported as an unavailable
 * beta capability rather than exposing a fake URL or silently falling back to
 * an external image host.
 */
export async function uploadSpecialistPortrait(
  formData: FormData
): Promise<PortraitUploadResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { kind: "error", message: "Not signed in" };

  const candidate = formData.get("portrait");
  const parsed = portraitUploadSchema.safeParse({ file: candidate });
  if (!parsed.success) {
    return { kind: "error", message: "Choose a portrait before uploading." };
  }
  const file = parsed.data.file;
  const metadata = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES];
  const metadataError = validatePortraitFile(file);
  if (metadataError || !metadata) {
    return { kind: "error", message: metadataError ?? "Choose a valid portrait." };
  }
  try {
    const bytesError = await validatePortraitBytes(file);
    if (bytesError) return { kind: "error", message: bytesError };

    // R2-backed media storage is a later release gate. Do not write to a
    // local disk or manufacture a preview URL while that gate is closed.
    void metadata;
    return {
      kind: "unavailable",
      message: "Portrait uploads are not enabled yet. You can finish your profile without a photo."
    };
  } catch {
    return {
      kind: "unavailable",
      message: "Portrait uploads are temporarily unavailable. Please try again later."
    };
  }
}
