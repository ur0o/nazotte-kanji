/**
 * claude.ai のプレビュー(テスト用ページ)向けのビルド。
 * 公開用のビルド(dist/)とアプリのコードには手を加えず、出力先を dist-preview/ に分ける。
 *
 * プレビューでは公開できるファイル数に上限があるため、1字ごとの出題 JSON を
 * data/bundle.json の1ファイルにまとめ、そこから返すよう fetch を差し替えるスクリプトを足す。
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "dist-preview");
const DATA_DIR = path.join(OUT_DIR, "data");
const TITLE = "漢字書き順クイズ テスト版";

// 出題データへのリクエストを data/bundle.json の中身で返す。
// ビューアーのテーマ(data-theme)が明示されていれば、Mantine の配色にも反映する。
const SHIM = `(() => {
  try {
    const theme = document.documentElement.dataset.theme;
    if (theme === "dark" || theme === "light") {
      localStorage.setItem("mantine-color-scheme-value", theme);
    }
  } catch {}
  const realFetch = window.fetch.bind(window);
  let bundle;
  const loadBundle = () =>
    (bundle ??= realFetch("./data/bundle.json").then((response) => {
      if (!response.ok) throw new Error("data/bundle.json を読み込めませんでした");
      return response.json();
    }));
  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    const match = /\\/data\\/(index\\.json|kanji\\/[0-9a-f]+\\.json)$/.exec(url.pathname);
    if (!match) return realFetch(input, init);
    const body = (await loadBundle())[match[1]];
    return body === undefined
      ? new Response("Not found", { status: 404 })
      : new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
  };
})();
`;

function build(): void {
  execFileSync(
    "pnpm",
    ["exec", "vite", "build", "--outDir", OUT_DIR, "--emptyOutDir"],
    {
      cwd: ROOT,
      stdio: "inherit",
    },
  );
}

function bundleData(): void {
  const bundle: Record<string, unknown> = {
    "index.json": JSON.parse(
      readFileSync(path.join(DATA_DIR, "index.json"), "utf8"),
    ),
  };
  for (const file of readdirSync(path.join(DATA_DIR, "kanji"))) {
    bundle[`kanji/${file}`] = JSON.parse(
      readFileSync(path.join(DATA_DIR, "kanji", file), "utf8"),
    );
  }
  rmSync(DATA_DIR, { recursive: true });
  mkdirSync(DATA_DIR);
  writeFileSync(path.join(DATA_DIR, "bundle.json"), JSON.stringify(bundle));
}

/** プレビューのページは doctype や head を持たない本文として書く(公開時に外枠が付く) */
function rewriteHtml(): void {
  const htmlPath = path.join(OUT_DIR, "index.html");
  const html = readFileSync(htmlPath, "utf8");
  const assets = [
    ...html.matchAll(
      /<(?:script|link)\b[^>]*(?:src|href)="\.\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g,
    ),
  ].map((match) => match[0]);
  if (assets.length === 0)
    throw new Error("index.html にビルド済みのファイルが見つかりません");
  writeFileSync(
    htmlPath,
    [
      `<title>${TITLE}</title>`,
      '<meta name="description" content="漢字の各画の終わり方(とめ・はね・はらい)だけを手がかりに、元の漢字を当てるクイズのテスト版" />',
      '<script src="./preview-shim.js"></script>',
      ...assets,
      '<div id="root"></div>',
      "",
    ].join("\n"),
  );
  writeFileSync(path.join(OUT_DIR, "preview-shim.js"), SHIM);
}

build();
bundleData();
rewriteHtml();
console.log(`テスト用ページを ${path.relative(ROOT, OUT_DIR)}/ に出力しました`);
