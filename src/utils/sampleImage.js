/**
 * Image sampler using offscreen canvas with pixel caching
 */

const imageCache = new Map();

function createRasterCanvas(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Raster size for mosaic sampling (higher = sharper, more memory per cached image). */
export const SAMPLE_GRID_SIZE = 1024;

export function getImagePixelData(imageBitmap, width = SAMPLE_GRID_SIZE, height = SAMPLE_GRID_SIZE) {
  const key = `${imageBitmap.width}-${imageBitmap.height}-${width}-${height}`;

  if (imageCache.has(imageBitmap)) {
    const cached = imageCache.get(imageBitmap);
    if (cached.key === key) {
      return cached.data;
    }
  }

  const canvas = createRasterCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new Uint8ClampedArray(width * height * 4);
  }

  try {
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    imageCache.set(imageBitmap, { key, data });
    return data;
  } catch {
    const fallback = new Uint8ClampedArray(width * height * 4);
    imageCache.set(imageBitmap, { key, data: fallback });
    return fallback;
  }
}

export function samplePixelColor(imageBitmap, u, v, canvasSize = SAMPLE_GRID_SIZE) {
  const pixelData = getImagePixelData(imageBitmap, canvasSize, canvasSize);

  const uClamped = Math.max(0, Math.min(1, u));
  const vClamped = Math.max(0, Math.min(1, v));

  const x = Math.floor(uClamped * (canvasSize - 1));
  const y = Math.floor(vClamped * (canvasSize - 1));

  const index = (y * canvasSize + x) * 4;

  return {
    r: pixelData[index] / 255,
    g: pixelData[index + 1] / 255,
    b: pixelData[index + 2] / 255,
    a: pixelData[index + 3] / 255,
  };
}

export function invalidateImageCache(imageBitmap) {
  imageCache.delete(imageBitmap);
}

export function clearImageCache() {
  imageCache.clear();
}
