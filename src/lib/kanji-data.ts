import { z } from "zod";

/** 終わり方: とめ / はね / はらい */
export const endingSchema = z.enum(["tome", "hane", "harai"]);
export type Ending = z.infer<typeof endingSchema>;

/** 終わるときの向き。8方向で、画面の上が N */
export const directionSchema = z.enum([
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
  "N",
  "NE",
]);
export type Direction = z.infer<typeof directionSchema>;

/** 座標は KanjiVG と同じ 109×109 の座標系 */
export const strokeSchema = z.object({
  path: z.string().min(1),
  end: z.tuple([z.number(), z.number()]),
  direction: directionSchema,
  ending: endingSchema,
});
export type Stroke = z.infer<typeof strokeSchema>;

/** public/data/kanji/<コードポイント>.json */
export const kanjiStrokesSchema = z.object({
  kanji: z.string().length(1),
  strokes: z.array(strokeSchema).min(1),
});
export type KanjiStrokes = z.infer<typeof kanjiStrokesSchema>;

export const kanjiEntrySchema = z.object({
  kanji: z.string().length(1),
  /** 音読み(カタカナ) */
  on: z.array(z.string()),
  /** 訓読み(ひらがな)。KANJIDIC2 の表記のまま、送り仮名の前に "." が入る */
  kun: z.array(z.string()),
});
export type KanjiEntry = z.infer<typeof kanjiEntrySchema>;

/** public/data/index.json */
export const kanjiIndexSchema = z.object({
  kanji: z.array(kanjiEntrySchema).min(1),
});
export type KanjiIndex = z.infer<typeof kanjiIndexSchema>;

/** 1字分のデータのファイル名(拡張子なし)。コードポイントの16進数 5桁 */
export function kanjiFileName(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (codePoint === undefined) throw new Error("Empty kanji");
  return codePoint.toString(16).padStart(5, "0");
}
