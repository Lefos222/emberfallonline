import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
// Build-time only: Git metadata never enters the published server runtime.
try {
  const log = execFileSync("git", ["log", "--format=%h%x09%aI%x09%s%x09%b%x1e"], { encoding: "utf8" });
  const entries = log.split("\x1e").filter(line => line.trim()).map(line => {
    const [id, date, title, ...body] = line.trim().split("\t");
    return { id, date, title, details: body.join("\t").trim(), kind: /^merge/i.test(title) ? "merge" : /fix|repair/i.test(title) ? "hotfix" : "update" };
  });
  writeFileSync("src/game/update-history.json", JSON.stringify(entries, null, 2) + "\n");
} catch {
  // Source archives may not have Git; retain the committed announcement archive.
  JSON.parse(readFileSync("src/game/update-history.json", "utf8"));
}