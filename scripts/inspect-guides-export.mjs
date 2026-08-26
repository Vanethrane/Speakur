import { readFileSync } from "fs";
const raw = readFileSync("assets/guides-data.js", "utf8");
const json = raw.replace(/^[\s\S]*?window\.SPEAKUR_GUIDES\s*=\s*/, "").replace(/;\s*$/, "");
const guides = JSON.parse(json);
const x = guides.find((i) => i.slug === "how-ai-speech-synthesis-works");
console.log(
  JSON.stringify(
    {
      sections: x.sections.length,
      synopsis: (x.synopsis || []).length,
      tldr: (x.tldr || []).length,
      headings: x.sections.map((s) => s.heading),
      words: [x.title, x.description, ...(x.synopsis || []), ...(x.tldr || []), ...x.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
        .join(" ")
        .trim()
        .split(/\s+/).length,
    },
    null,
    2,
  ),
);
console.log("has week template?", JSON.stringify(guides).includes("Consider a concrete week"));
console.log("guides with synopsis", guides.filter((g) => g.synopsis?.length).length);
