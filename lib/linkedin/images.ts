import { linkedinCall } from "./client";
import { claimCalls } from "./budget";

/**
 * An image on a post is three calls, and each one fails independently:
 *
 *   1. POST /rest/images?action=initializeUpload  gives back an upload URL
 *      and the image URN the post will reference.
 *   2. PUT the bytes to that URL. It is not on api.linkedin.com and it takes
 *      no version header, so it does not go through linkedinCall. It is still
 *      a LinkedIn call and it still costs the member one of their 150.
 *   3. Reference the URN in the post body, which posts.ts does.
 *
 * Returning which step failed is the point. "The image did not upload" tells
 * the operator nothing, and this runs unattended at 09:00.
 */

export type UploadStep = "initialize" | "fetch" | "upload";

export type ImageUploadResult =
  | { ok: true; imageUrn: string }
  | { ok: false; step: UploadStep; error: string };

type InitializeResponse = {
  value?: {
    uploadUrl?: string;
    image?: string;
  };
};

export async function uploadImage(opts: {
  accessToken: string;
  memberId: string;
  ownerUrn: string;
  /** Public Vercel Blob URL written when the image was generated. */
  imageUrl: string;
}): Promise<ImageUploadResult> {
  const initialized = await linkedinCall<InitializeResponse>({
    accessToken: opts.accessToken,
    memberId: opts.memberId,
    method: "POST",
    path: "/rest/images?action=initializeUpload",
    body: { initializeUploadRequest: { owner: opts.ownerUrn } },
  });

  if (!initialized.ok) {
    return {
      ok: false,
      step: "initialize",
      error: `initializeUpload ${initialized.status} ${initialized.code ?? ""} ${initialized.message}`.trim(),
    };
  }

  const uploadUrl = initialized.data?.value?.uploadUrl;
  const imageUrn = initialized.data?.value?.image;
  if (!uploadUrl || !imageUrn) {
    return {
      ok: false,
      step: "initialize",
      error: "initializeUpload returned no upload URL or image URN.",
    };
  }

  let bytes: ArrayBuffer;
  try {
    // Our own Blob store. A failure here is ours, not LinkedIn's, which is why
    // it is a separate step in the result.
    const blob = await fetch(opts.imageUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!blob.ok) {
      return {
        ok: false,
        step: "fetch",
        error: `The stored image returned ${blob.status}.`,
      };
    }
    bytes = await blob.arrayBuffer();
  } catch (cause) {
    return {
      ok: false,
      step: "fetch",
      error: cause instanceof Error ? cause.message : "Could not read the stored image.",
    };
  }

  const claim = await claimCalls(opts.memberId);
  if (!claim.ok) {
    return {
      ok: false,
      step: "upload",
      error: `This profile has used all ${claim.budget.limit} LinkedIn calls for ${claim.budget.day}.`,
    };
  }

  let uploaded: Response;
  try {
    uploaded = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch (cause) {
    return {
      ok: false,
      step: "upload",
      error: cause instanceof Error ? cause.message : "The upload did not complete.",
    };
  }

  if (!uploaded.ok) {
    const raw = await uploaded.text();
    return {
      ok: false,
      step: "upload",
      error: `Upload returned ${uploaded.status}: ${raw.slice(0, 300)}`,
    };
  }

  return { ok: true, imageUrn };
}
