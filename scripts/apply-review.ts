/**
 * 確認ページで入力した修正を data/overrides.json に取り込む。
 *
 * 使い方: pnpm review:apply <修正を書き出した JSON>
 * JSON の形: { "corrections": [{ "kanji": "漢", "strokes": { "3": { "ending": "hane" } } }] }
 * (確認ページの保存領域 corrections コレクションの各ドキュメントの中身)
 */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { directionSchema, endingSchema } from "../src/lib/kanji-data.ts";
import {
  analyzeKanji,
  assertSourcesFetched,
  loadJouyou,
  loadOverrides,
  saveOverrides,
} from "./lib/kanji-analysis.ts";

const inputSchema = z.object({
  corrections: z.array(
    z.object({
      kanji: z.string().length(1),
      strokes: z.record(
        z.string().regex(/^[1-9]\d*$/),
        z.object({
          ending: endingSchema.optional(),
          direction: directionSchema.optional(),
        }),
      ),
    }),
  ),
});

const file = process.argv[2];
if (!file) throw new Error("修正を書き出した JSON のパスを指定してください");

assertSourcesFetched();
const jouyou = loadJouyou();
const { corrections } = inputSchema.parse(
  JSON.parse(readFileSync(file, "utf8")),
);
const overrides = loadOverrides();
let changed = 0;

for (const { kanji, strokes } of corrections) {
  if (!(kanji in jouyou))
    throw new Error(`「${kanji}」は常用漢字ではありません`);
  const analysis = analyzeKanji(kanji);
  const kanjiOverrides = { ...overrides[kanji] };
  for (const [number, correction] of Object.entries(strokes)) {
    const auto = analysis[Number(number) - 1];
    if (!auto) throw new Error(`「${kanji}」に${number}画目はありません`);
    const next = { ...kanjiOverrides[number], ...correction };
    // 自動推定と同じになった項目は修正として残さない
    if (next.ending === auto.ending) delete next.ending;
    if (next.direction === auto.directions[next.ending ?? auto.ending]) {
      delete next.direction;
    }
    if (JSON.stringify(next) !== JSON.stringify(kanjiOverrides[number] ?? {})) {
      changed += 1;
    }
    if (Object.keys(next).length === 0) delete kanjiOverrides[number];
    else kanjiOverrides[number] = next;
  }
  if (Object.keys(kanjiOverrides).length === 0) delete overrides[kanji];
  else overrides[kanji] = kanjiOverrides;
}

saveOverrides(overrides);
console.log(
  `${corrections.length}字分の修正を読み込み、${changed}画の修正を data/overrides.json に反映しました`,
);
