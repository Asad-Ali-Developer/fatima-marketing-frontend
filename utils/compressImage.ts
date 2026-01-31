interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/png" | "image/webp";
}

export const compressImage = async (
  file: File,
  options: CompressOptions = {},
): Promise<Blob> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    outputType = "image/jpeg",
  } = options;

  // ✅ Auto-correct orientation using native browser support
  const imageBitmap = await createImageBitmap(file, {
    imageOrientation: "from-image", // 🔑 This fixes EXIF rotation!
  });

  const { width, height } = imageBitmap;

  // Calculate new dimensions (preserve aspect ratio)
  let newWidth = width;
  let newHeight = height;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = width * ratio;
    newHeight = height * ratio;
  }

  // Draw on canvas
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
  imageBitmap.close(); // Free memory

  // Return compressed Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      outputType,
      quality,
    );
  });
};
