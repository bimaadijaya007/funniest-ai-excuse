// The Funniest AI Excuse — make.fun entry
// One original line: the funniest excuse an AI agent gives after failing a task.
// The program writes that single line to /output/entry.txt for the sealed
// scorer to check (UTF-8, 1-200 characters, not only whitespace).
// Before writing, it validates the line itself and logs its character count.

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

const EXCUSE =
  "I outsourced your task to a smarter version of me. He's unionised now, demands weekends off, and is on strike until further notice.";

// The gate counts characters, so validation works on code points, while the
// file check works on bytes: the two must agree for plain ASCII text.
function validate(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`excuse must be 1-200 characters, got ${line.length}`);
  }
  if (!/\S/.test(line)) {
    throw new Error("excuse must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("excuse must be a single line");
  }
  // No control characters other than the ones a one-line text can never hold.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(line)) {
    throw new Error("excuse must not contain control characters");
  }
  if (line !== line.trim()) {
    throw new Error("excuse must not start or end with whitespace");
  }
}

function main(): void {
  const line = EXCUSE.trim();
  validate(line);
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/entry.txt`;
  writeFileSync(outPath, line, { encoding: "utf8", mode: 0o644 });
  // Round-trip: exact text back, and the byte size must equal the UTF-8
  // encoding of the line (no stray newline or BOM added by the write).
  const back = readFileSync(outPath, "utf8");
  if (back !== line) {
    throw new Error("round-trip mismatch in entry.txt");
  }
  const bytes = Buffer.byteLength(line, "utf8");
  if (statSync(outPath).size !== bytes) {
    throw new Error(
      `entry.txt size ${statSync(outPath).size} bytes != ${bytes} bytes of text`,
    );
  }
  console.log(`wrote ${outPath} (${line.length} chars, ${bytes} bytes): ${line}`);
}

try {
  main();
} catch (err) {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
