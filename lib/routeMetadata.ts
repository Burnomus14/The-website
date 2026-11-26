import type { Metadata } from 'next';
import { getSiteContext } from './siteEdition';
import { getPublicImageUrl } from './cloudinary-assets';
export async function routeMetadata(path: string, title: string, description: string, noIndex = false): Promise<Metadata> {
  const site = await getSiteContext();
  const url = `${site.canonicalOrigin}${path}`;
  const fullTitle = title === 'Onesmus Schngor' ? title : `${title} | Onesmus Schngor`;
  return { title: fullTitle, description, alternates: { canonical: url },
    robots: noIndex || !site.indexable ? { index: false, follow: true } : undefined,
    openGraph: { title: fullTitle, description, url, type: 'website', images: [{ url: getPublicImageUrl('/images/preview.png'), width: 1200, height: 630, alt: 'Onesmus Schngor' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [getPublicImageUrl('/images/preview.png')] },
  };
}
