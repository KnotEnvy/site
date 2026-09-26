import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { STUDY_THEMES } from "@/lib/content/scripture";
import { STUDIES } from "@/lib/content/evidence";
import { TRANSLATION_NOTE } from "@/lib/content/bible";

/**
 * /llms.txt - a plain-Markdown map of the site for AI answer engines (the
 * llmstxt.org convention). Generated from the same registries as the nav and
 * sitemap, so it can never drift from what the site actually contains.
 * Static: rendered once at build.
 */
export const dynamic = "force-static";

export function GET() {
  const url = (p: string) => (p === "/" ? SITE_URL : `${SITE_URL}${p}`);
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Eternal Truth presents near-death experience (NDE) research, the scientific case for God, and what the Bible says about life after death, Heaven, Hell and salvation. Research claims are sourced to published studies (for example van Lommel et al., The Lancet, 2001; Parnia et al., AWARE, 2014), and the strongest skeptical explanations are presented alongside them. Quotations from scientists are checked against their sources.",
    "",
    "## Pages",
    "",
    ...PAGES.map((p) => `- [${p.name}](${url(p.href)}): ${p.description}`),
    "",
    "## Bible studies",
    "",
    ...STUDY_THEMES.map((t) => `- [${t.title}: ${t.question}](${url(`/scripture/${t.slug}`)}): ${t.description}`),
    "",
    "## Key research cited",
    "",
    ...STUDIES.map((s) => `- ${s.year}, ${s.who}: ${s.title}. ${s.finding}${s.url ? ` (${s.url})` : ""}`),
    "",
    "## Notes",
    "",
    `- ${TRANSLATION_NOTE}`,
    "- Contact: Eternaltruth303@gmail.com · Instagram @theeternaltruth.official",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
