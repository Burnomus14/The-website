# Cloudinary image hosting

The site can serve image files from `public/` through Cloudinary. The original files stay in the repository as a local-development fallback; fonts and animation JSON files are not uploaded.

## Upload the public images

1. In Cloudinary, find the cloud name, API key, and API secret.
2. Put those values in the ignored `.env.local` file:

   ```dotenv
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. Run:

   ```sh
   npm run cloudinary:upload-public-images
   ```

The uploader stores files under public IDs matching their paths relative to `public/` (without file extensions). It is safe to rerun: the same public IDs are overwritten. The script uploads supported image formats only and stops with an error if an upload fails.
The API key must have permission to create/upload assets; a `403` mentioning missing `create` permission means the credentials need a role or account with upload access.

To check the asset count and detect public-ID collisions without uploading, run `npm run cloudinary:upload-public-images -- --dry-run`.

Never commit `.env.local`, expose the API secret through a `NEXT_PUBLIC_` variable, or add the API key/secret to Render's runtime configuration.

## Serve images from Render

After the upload finishes, set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to the same cloud name in Render's environment settings, then redeploy. Next.js reads this public setting during the build. Do not set it locally unless you also want local development to use Cloudinary.

When the setting is absent, images continue to use their existing local URLs. When set, repository image URLs point directly to Cloudinary; Sanity, WordPress, and other external images are not rewritten.
