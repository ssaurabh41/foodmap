/**
 * Sends one fictional raw place through DeepSeek and prints the result.
 * Usage: put DEEPSEEK_API_KEY in .env at the repo root, then `npm run enrich:sample`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { enrichPlace } from "../enrich";
import { createDeepSeekClient } from "../llm";
import type { RawPlace } from "../sources/types";

const root = fileURLToPath(new URL("../../../", import.meta.url));

try {
  process.loadEnvFile(`${root}.env`);
} catch {
  // No .env file; fall back to the real environment.
}

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.error("DEEPSEEK_API_KEY is not set. Copy .env.example to .env and add your key.");
  process.exit(1);
}

const llm = createDeepSeekClient({
  apiKey,
  model: process.env.DEEPSEEK_MODEL || undefined,
  baseURL: process.env.DEEPSEEK_BASE_URL || undefined,
});

const raw = JSON.parse(
  await readFile(new URL("../../fixtures/raw-place.json", import.meta.url), "utf8"),
) as RawPlace;

const started = Date.now();
const result = await enrichPlace(raw, llm);
const outDir = `${root}pipeline/out`;
await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/enriched-sample.json`, JSON.stringify(result, null, 2));

console.log(`${result.restaurant.name.en} (${result.restaurant.name.zh}) in ${Date.now() - started} ms`);
console.log(result.restaurant.summary);
for (const d of result.dishes) {
  console.log(`- ${d.name.zh} ${d.name.en} · ${d.diet} · spice ${d.spice} · ${d.source.kind}`);
}
console.log(`Full output: pipeline/out/enriched-sample.json`);
