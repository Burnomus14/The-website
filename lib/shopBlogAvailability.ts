/** Keep Shop and Blog local to the development site until the Render release is ready. */
export function areShopAndBlogAvailable(): boolean {
  return process.env.RENDER !== 'true';
}
