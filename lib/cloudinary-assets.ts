const IMAGE_EXTENSION = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tif?f|webp)$/i;

export function getPublicImageUrl(src: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) return src;
  if (!/^[a-z0-9_-]+$/i.test(cloudName)) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must be a valid Cloudinary cloud name.');
  }
  if (!src.startsWith('/') || src.startsWith('//')) return src;

  const url = new URL(src, 'https://local.invalid');
  if (url.origin !== 'https://local.invalid' || !IMAGE_EXTENSION.test(url.pathname)) return src;

  const publicPath = url.pathname.slice(1).split('/').map((segment) => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  }).join('/');

  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${publicPath}${url.search}${url.hash}`;
}
