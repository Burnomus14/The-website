import { getBlogEnabled } from '../lib/getBlogFlag';
import { getRecentBlogPostsEnabled } from '../lib/getRecentBlogPostsFlag';
import { areShopAndBlogAvailable } from '../lib/shopBlogAvailability';

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.RENDER;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

it('keeps Shop and Blog available outside Render', () => {
  expect(areShopAndBlogAvailable()).toBe(true);
});

it('disables Shop and Blog, including homepage blog fetches, on Render', async () => {
  process.env.RENDER = 'true';

  expect(areShopAndBlogAvailable()).toBe(false);
  await expect(getBlogEnabled()).resolves.toBe(false);
  await expect(getRecentBlogPostsEnabled()).resolves.toBe(false);
});
