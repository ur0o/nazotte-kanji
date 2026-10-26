import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { SOURCES, type Source } from "./sources.ts";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

/** チェックアウト済みのコミット。まだ何もチェックアウトしていなければ undefined */
function currentCommit(cwd: string): string | undefined {
  try {
    return git(cwd, "rev-parse", "--verify", "--quiet", "HEAD^{commit}").trim();
  } catch {
    return undefined;
  }
}

function fetchSource(source: Source): void {
  mkdirSync(source.dir, { recursive: true });
  if (!existsSync(`${source.dir}/.git`)) {
    git(source.dir, "init", "--quiet");
    git(source.dir, "remote", "add", "origin", source.repository);
  }
  if (currentCommit(source.dir) === source.commit) {
    console.log(`${source.name}: ${source.commit} は取得済み`);
    return;
  }
  console.log(`${source.name}: ${source.commit} を取得中…`);
  git(source.dir, "fetch", "--quiet", "--depth", "1", "origin", source.commit);
  git(source.dir, "checkout", "--quiet", "--detach", "FETCH_HEAD");
}

for (const source of SOURCES) {
  fetchSource(source);
}
