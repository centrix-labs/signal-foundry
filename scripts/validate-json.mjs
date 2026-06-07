import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
if (!root) {
  throw new Error("Usage: node scripts/validate-json.mjs <directory>");
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const filePath = join(directory, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith(".json")) {
      JSON.parse(readFileSync(filePath, "utf8"));
    }
  }
}

walk(root);
console.log(`Validated JSON under ${root}`);
