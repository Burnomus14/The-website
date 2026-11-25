import { getPublicImageUrl } from '../lib/cloudinary-assets';

describe('getPublicImageUrl', () => {
  const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  afterEach(() => {
    if (originalCloudName === undefined) delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    else process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
  });

  it('keeps local paths when Cloudinary is not configured', () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    expect(getPublicImageUrl('/images/home/profile.png')).toBe('/images/home/profile.png');
  });

  it('maps public image paths and preserves query strings', () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud';
    expect(getPublicImageUrl('/volume%20high.svg?v=2'))
      .toBe('https://res.cloudinary.com/test-cloud/image/upload/volume%20high.svg?v=2');
  });

  it('does not rewrite external URLs or non-image public files', () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud';
    expect(getPublicImageUrl('https://cdn.sanity.io/image.png')).toBe('https://cdn.sanity.io/image.png');
    expect(getPublicImageUrl('/fonts/site.woff2')).toBe('/fonts/site.woff2');
  });

  it('rejects invalid Cloudinary cloud names instead of producing broken URLs', () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'not/a/cloud';
    expect(() => getPublicImageUrl('/images/home/profile.png'))
      .toThrow('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must be a valid Cloudinary cloud name.');
  });
});
