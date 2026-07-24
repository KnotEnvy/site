# Deploying to Netlify

Condensed runbook. The full engineering handoff (`handoff.json`) and the
original brief (`notes/`, `screenshots/`) live at the **repo root, one level
above this git repo**, so they do not arrive with a `git clone` — get them from
the previous team.

## 1. Push

```bash
git push          # branch 'master'; several commits are local-only
```

## 2. Create the Netlify site

Connect the repository. This git repo's root is the Next.js app itself, so
there is **no base directory to configure**. `netlify.toml` supplies:

- `npm run build` and `.next` as the publish directory
- the Image CDN allowlist for `https://i.ytimg.com/vi/.*` (YouTube thumbnails
  on the video cards go through `next/image`, and Netlify requires remote
  sources to be declared)

The Next.js runtime (`@netlify/plugin-nextjs`) is auto-detected. Node 24+.

## 3. Verify the first deploy

| Check | Expected |
| --- | --- |
| `/` | WebGL sky renders and descends Heaven→Hell on scroll |
| `/og.jpg` | 1200×630 share card |
| `/robots.txt` | allows `/`, points at the sitemap |
| `/sitemap.xml` | absolute URL on the deployed domain |
| Share the URL in Slack/iMessage/X | unfurls with the OG card |
| Any video card | thumbnail loads; click opens the lightbox with playlist |

`lib/site.ts` reads Netlify's `URL` environment variable at build time, so
canonical and OG URLs track the site's primary domain automatically — including
after a custom domain is attached. Nothing to hardcode.

## 4. After a custom domain is attached

Set it as the **primary** domain in Netlify, redeploy, then regenerate the
share cards against the live site and commit them:

```bash
node scripts/make-og.mjs https://your-domain.com
```

## Local commands

```bash
npm install
npm run dev                  # add `-- -p 3001` if 3000 is taken
npm run build                # STOP the dev server first (shared .next)
npm run lint
npx tsc --noEmit
```

## Before shipping any visual change

Never ship WebGL or animation work sight-unseen — this project lost an entire
phase to set-pieces that compiled, served HTTP 200, and rendered nothing. Run
the harness and **look at the PNGs**:

```bash
node scripts/verify-visuals.mjs http://localhost:3000 ./.verify   # 8 scroll depths
node scripts/verify-rails.mjs   http://localhost:3000 ./.verify   # thumbnails + lightbox
node scripts/verify-spots.mjs   http://localhost:3000 ./.verify   # stats, modal font, focus trap
node scripts/verify-reduced.mjs http://localhost:3000 ./.verify   # reduced motion; exits 1 on hydration errors
```

`verify-reduced.mjs` matters more than it looks: the stakeholder's own machine
has OS Reduced Motion enabled, and an SSR'd motion transform already caused one
sticky hydration bug there. See `criticalLessons` #11 in the handoff.
