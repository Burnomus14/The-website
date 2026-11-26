import type { MetadataRoute } from 'next';
import { getSiteContext } from '../lib/siteEdition';
import { fetchPublicSitemapPosts } from '../lib/blog';
import { areShopAndBlogAvailable } from '../lib/shopBlogAvailability';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteContext();
  if (!site.indexable) return [];
  const base = site.canonicalOrigin;
  if (!areShopAndBlogAvailable()) {
    return ['/', '/contact'].map(path => ({ url: `${base}${path}` }));
  }
  const posts = await fetchPublicSitemapPosts(site.edition);
  return [ ...['/', '/blog', '/contact', '/shop'].map(path => ({ url: `${base}${path}` })),
    ...posts.map(post => ({ url: `${base}/blog/${post.slug}`, lastModified: post.date })),
  ];
}
