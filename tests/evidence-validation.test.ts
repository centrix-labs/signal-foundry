import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const validator = `${repoRoot}/scripts/validate-evidence.mjs`;
const evidenceDirectory = `${repoRoot}/evidence`;

describe("Signal Foundry evidence validation", () => {
  it("passes the judge evidence validator", () => {
    const output = execFileSync(process.execPath, [validator, evidenceDirectory], {
      encoding: "utf8"
    });

    expect(output).toContain("Evidence validation pass");
  });
});
