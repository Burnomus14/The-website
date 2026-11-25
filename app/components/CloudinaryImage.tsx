import NextImage, { type ImageProps } from 'next/image';
import { getPublicImageUrl } from '../../lib/cloudinary-assets';

export default function CloudinaryImage({ src, unoptimized, ...props }: ImageProps) {
  const cloudinarySrc = typeof src === 'string' ? getPublicImageUrl(src) : src;
  const usesCloudinary = typeof src === 'string' && cloudinarySrc !== src;

  return (
    <NextImage
      {...props}
      src={cloudinarySrc}
      unoptimized={usesCloudinary || unoptimized}
    />
  );
}
