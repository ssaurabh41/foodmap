// Turns the single-file mockup build into a page body for publishing as a claude.ai Artifact:
// the Artifact host adds its own <html>/<head>/<body> wrapper, so those tags are removed.
import { readFileSync, writeFileSync } from "node:fs";

const src = "web/dist-mockup/index.html";
const out = "web/dist-mockup/foodmap-mockup.html";
const html = readFileSync(src, "utf8");

const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
const keep = head
  .split("\n")
  .filter((line) => !/<meta (charset|name="viewport")/i.test(line))
  .join("\n");

writeFileSync(out, `${keep.trim()}\n${body.trim()}\n`);
console.log(`Wrote ${out} (${Math.round((keep.length + body.length) / 1024)} KB)`);
