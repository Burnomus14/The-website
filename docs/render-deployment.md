# Render deployment

The existing Render Web Service is linked to this repository. Deployments from
the connected branch start automatically when code is pushed. This is separate
from the existing Vercel deployment.

## Service settings

- Runtime: Node.js 24 (selected by `.nvmrc`)
- Build command: `npm ci && npm run build`
- Start command: `npm start`

In the Render service's Environment settings, set
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to the Cloudinary cloud name used for the
uploaded public images. The Cloudinary API key and secret are only needed for
uploads and must not be added to Render.

Render provides `RENDER=true` automatically. On Render, the Shop and Blog
navigation links and routes are disabled, recent blog posts are not fetched,
and those routes are omitted from the sitemap. They remain available during
local development and on non-Render deployments.
