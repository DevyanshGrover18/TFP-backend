import crypto from "crypto";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isDataUrl(value) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

function getDataUrlSizeInBytes(value) {
  const base64Payload = value.split(",")[1] ?? "";
  const paddingLength = (base64Payload.match(/=*$/)?.[0]?.length ?? 0);

  return Math.floor((base64Payload.length * 3) / 4) - paddingLength;
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
    error.statusCode = 500;
    throw error;
  }

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params, apiSecret) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function createSignedUploadConfig(folder) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadParams = {
    folder,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature: signCloudinaryParams(uploadParams, apiSecret),
  };
}

export async function storeImage(image, folder) {
  if (typeof image !== "string" || !image.trim()) {
    const error = new Error("Image is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedImage = image.trim();

  if (isRemoteUrl(normalizedImage)) {
    return normalizedImage;
  }

  if (!isDataUrl(normalizedImage)) {
    const error = new Error("Image must be a valid URL or base64 image");
    error.statusCode = 400;
    throw error;
  }

  if (getDataUrlSizeInBytes(normalizedImage) > MAX_IMAGE_SIZE_BYTES) {
    const error = new Error("Image must be 5 MB or smaller");
    error.statusCode = 400;
    throw error;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadParams = {
    folder,
    timestamp,
  };
  const signature = signCloudinaryParams(uploadParams, apiSecret);
  const body = new URLSearchParams();

  body.set("file", normalizedImage);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);

  if (folder) {
    body.set("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body,
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || typeof data?.secure_url !== "string") {
    const error = new Error(data?.error?.message ?? "Failed to upload image");
    error.statusCode = 500;
    throw error;
  }

  return data.secure_url;
}
