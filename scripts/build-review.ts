/**
 * 出題データの確認・修正ページ(claude.ai の非公開ページ)向けのビルド。
 * 公開用のビルドとは別に dist-review/ へ出力する。
 *
 * ページには、各画の自動推定・KanjiVG の画の種類・data/overrides.json による修正を
 * まとめた review-data.json を添える。ページで入力した修正はページの保存領域に残り、
 * pnpm review:apply で data/overrides.json に取り込む。
 */
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { kanjiFileName } from "../src/lib/kanji-data.ts";
import {
  analyzeKanji,
  assertSourcesFetched,
  loadJouyou,
  loadOverrides,
  ROOT,
  sortKanji,
} from "./lib/kanji-analysis.ts";
import { hiraganaToKatakana } from "./lib/readings.ts";

const OUT_DIR = path.join(ROOT, "dist-review");

assertSourcesFetched();
const jouyou = loadJouyou();
const overrides = loadOverrides();

const kanji = sortKanji(Object.keys(jouyou)).map((character) => ({
  kanji: character,
  file: kanjiFileName(character),
  on: (jouyou[character]?.readings_on ?? []).map(hiraganaToKatakana),
  kun: jouyou[character]?.readings_kun ?? [],
  strokes: analyzeKanji(character).map((stroke) => ({
    path: stroke.path,
    end: stroke.end,
    type: stroke.type ?? null,
    auto: stroke.ending,
    reason: stroke.reviewReason ?? null,
    directions: stroke.directions,
    override: overrides[character]?.[String(stroke.number)] ?? null,
  })),
}));

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR);
writeFileSync(
  path.join(OUT_DIR, "review-data.json"),
  JSON.stringify({ kanji }),
);
copyFileSync(
  path.join(ROOT, "tools/review/index.html"),
  path.join(OUT_DIR, "index.html"),
);
console.log(
  `確認ページを ${path.relative(ROOT, OUT_DIR)}/ に出力しました(${kanji.length}字)`,
);
