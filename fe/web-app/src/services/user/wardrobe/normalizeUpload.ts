const MAX_SIDE = 1568;
const MAX_BYTES = 10 * 1024 * 1024;

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file); } catch { /* Some formats decode through Image instead. */ }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Trình duyệt không đọc được định dạng ảnh này. Hãy đổi sang WebP, PNG hoặc JPEG.'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Browser decodes WebP, AVIF, GIF, BMP and supported HEIC before the backend receives JPEG. */
export async function normalizeUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error(`${file.name} không phải là ảnh.`);
  }
  if (file.type === 'image/jpeg' && file.size <= 2 * 1024 * 1024) return file;
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await loadImage(file);
  } catch {
    throw new Error(`Không mở được ${file.name}. Hãy dùng JPEG, PNG, WebP, AVIF, GIF hoặc ảnh HEIC được thiết bị hỗ trợ.`);
  }
  try {
    const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Không thể xử lý ảnh trên thiết bị này.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Không chuyển được ảnh sang JPEG.')), 'image/jpeg', 0.86),
    );
    if (blob.size > MAX_BYTES) throw new Error(`${file.name} vượt quá giới hạn 10 MB sau khi xử lý.`);
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally {
    if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) source.close();
  }
}
