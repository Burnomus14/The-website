# Editing the Projects carousel

Open the `featured-stories` Edge Config store in the `tjg-website` Vercel team,
then edit the **`projects`** key. The store name is historical; it contains both
Popular Stories and Projects. Save the JSON and reload the homepage after
propagation (normally a few seconds). No commit, redeploy or webhook is needed.
The same list serves main, college and both beta mirrors. Array order is display
order; `enabled: false` hides a card without deleting it, and `[]` hides all cards.

Example entry:

```json
{
  "title": "My new project",
  "description": "A short description of what it does.",
  "thumbnail": "https://your-image-host.example/project.png",
  "icon": "https://your-image-host.example/icon.png",
  "tags": ["Android", "Audio"],
  "bodyUrl": "https://example.com/project",
  "links": [
    { "label": "Download portal", "url": "https://example.com/download", "primary": true },
    { "label": "Get the app", "url": "https://example.com/app" }
  ],
  "tone": "dark",
  "action": "link",
  "actionIcon": "download"
}
```

`title` and `thumbnail` are required. A link card needs `actionUrl`, `bodyUrl`,
legacy `url`, or at least one valid entry in `links`. Description defaults to
empty; legacy `tag` is accepted as its fallback. `icon`, `bodyUrl`, and `tags`
are optional. `tags` is an array of strings shown as compact chips.

`links` is an optional array of labeled links with `label`, `url`, and an
optional `primary` boolean. When present, these render as labeled buttons in
place of the card's single icon action. The card body can still link to the
project repository through `bodyUrl`. Link URLs are validated with the same
safe content URL rules as other project destinations.

`tone` is `light` or `dark` (default). `action` is `link` (default) or
`copy-current-url`, which needs no destination. `actionIcon` is `download`,
`open` (default for links) or `link` (default for copy). New entries need no ID.

Images accept existing `/images/...` paths or public HTTPS URLs. Local images
remain optimized. External project images load directly so adding an image host
doesn't require changing Next's image allowlist; upload appropriately sized,
compressed images (approximately 852×604 for cards and 80×80 for icons).
Adding a *new local file* still requires a code deployment; use hosted images
for a workflow entirely in Edge Config. Keep connection tokens private.

`lib/projects.ts` reads the key server-side with `cache: 'no-store'`. Changes
appear on subsequent page requests after Edge Config propagation, not by live
updates to already-open tabs. The local four-card list is only an offline/outage
fallback when the connection or entire configuration is unavailable. Invalid or
disabled entries are skipped; valid entries aren't merged with local defaults.

The checked-in fallback now orders its cards as The Collection, Equalizer314
Setup, Farm Machinery Infographics, and This website. Farm Machinery links to
its Lovable preview. The deployed Edge Config list remains authoritative, so
apply matching edits to its `projects` key separately. Preserve disabled
entries when reordering the visible cards.

The **This website** card intentionally has no action or preview link until a
preview URL is supplied. The application clears links for that card even when
they remain in the Edge Config entry.
