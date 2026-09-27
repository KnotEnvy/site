# Eternal Truth

An evangelism site that brings people to God through the evidence of near-death
experiences, science, and Scripture, told as an experience rather than a page
of information. One WebGL sky runs behind the whole site and changes with every
page and every scroll.

**Live:** https://eternaltruth.netlify.app. Netlify auto-deploys every push
to `master`.

## Pages

| Route | What it is |
| --- | --- |
| `/` | The Descent: the original scroll story (Heaven to Hell), video vaults, evidence counters |
| `/evidence` | NDE research and the science of consciousness, with an interactive flatline scrub |
| `/great-minds` | Scientists, philosophers and contemplatives who found God at the height of learning |
| `/scripture` | Bible study guide, plus six study pages at `/scripture/[slug]` |
| `/the-ascent` | An interactive story: eight chapters, and a particle "spirit" that changes as you scroll |
| `/begin` | Next steps, honest answers to hard questions, crisis resources |

`/llms.txt`, `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest` are
generated from the same page registry.

## Where things live

- `lib/pages.ts`: the page registry. Nav, menu, footer, sitemap, llms.txt and
  each page's sky journey all read from it.
- `lib/journeys.ts`: each page's sky (palette, effects, camera path).
  `components/three/SkyCanvas.tsx` renders it and is never remounted between
  pages.
- `lib/content/*.ts`: the words. Bible passages (World English Bible, public
  domain), study themes, evidence, great minds. **Edit the copy here.**
- `lib/seo.ts`: per-page metadata and the JSON-LD graph. Every page builds its
  metadata with `pageMetadata()`.
- `components/ascent/AscentStory.tsx`: The Ascent's chapters and narration.
  `components/three/StoryParticles.tsx` is its spirit.
- `scripts/`: Playwright harnesses that screenshot the site on a real GPU,
  plus the OG share-card capture scripts.

## Run it

```bash
npm install
npm run dev -- -p 3001
```

Use port 3001: on the original dev machine, port 3000 belongs to another
project. Build and lint with `npm run build`, `npm run lint` and
`npx tsc --noEmit`.

**Before shipping any visual change, run the harness and look at the
screenshots.** Commands and the deploy runbook are in [DEPLOY.md](DEPLOY.md).

## The full handoff

The engineering handoff, `handoff.json`, sits one folder **above** this repo,
next to the client's original brief (`notes/`, `screenshots/`,
`clientFeedback.md`). It is not part of a clone, so get it from the previous
team. Read its `criticalLessons` before touching the sky, the reveal system or
the scroll code: every lesson there was paid for.
