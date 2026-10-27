import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  directionSchema,
  endingSchema,
  kanjiFileName,
  type Direction,
  type Ending,
} from "../../src/lib/kanji-data.ts";
import { KANJI_DATA, KANJIVG, SOURCES } from "../sources.ts";
import { parseKanjiVg } from "./kanjivg.ts";
import { endDirection, endPoint, estimateEnding } from "./stroke.ts";
import { flattenPath } from "./svg-path.ts";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const OVERRIDES_PATH = path.join(ROOT, "data/overrides.json");

const ENDINGS: readonly Ending[] = endingSchema.options;

const kanjiDataSchema = z.record(
  z.string(),
  z.object({
    readings_on: z.array(z.string()),
    readings_kun: z.array(z.string()),
  }),
);
export type KanjiData = z.infer<typeof kanjiDataSchema>;

/** { "漢": { "3": { "ending": "hane" } } } のように、漢字と書き順の番号で指定する */
export const overridesSchema = z.record(
  z.string().length(1),
  z.record(
    z.string().regex(/^[1-9]\d*$/),
    z
      .object({
        ending: endingSchema.optional(),
        direction: directionSchema.optional(),
      })
      .strict(),
  ),
);
export type Overrides = z.infer<typeof overridesSchema>;

export function assertSourcesFetched(): void {
  for (const source of SOURCES) {
    if (!existsSync(source.dir)) {
      throw new Error(
        `${source.name} がありません。先に pnpm data:fetch を実行してください`,
      );
    }
  }
}

/** 常用漢字の読み。キーの漢字はコードポイント順に並べ替えずに返す */
export function loadJouyou(): KanjiData {
  return kanjiDataSchema.parse(
    JSON.parse(
      readFileSync(path.join(KANJI_DATA.dir, "kanji-jouyou.json"), "utf8"),
    ),
  );
}

export function sortKanji(kanjiList: readonly string[]): string[] {
  return [...kanjiList].sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
  );
}

export function loadOverrides(): Overrides {
  if (!existsSync(OVERRIDES_PATH)) return {};
  return overridesSchema.parse(
    JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")),
  );
}

export function saveOverrides(overrides: Overrides): void {
  const sorted = Object.fromEntries(
    sortKanji(Object.keys(overrides)).map((kanji) => {
      const strokes = overrides[kanji] ?? {};
      return [
        kanji,
        Object.fromEntries(
          Object.keys(strokes)
            .sort((a, b) => Number(a) - Number(b))
            .map((number) => [number, strokes[number]]),
        ),
      ];
    }),
  );
  writeFileSync(OVERRIDES_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}

/** 1画分の自動解析の結果(手動の修正を当てる前) */
export interface StrokeAnalysis {
  /** 書き順(1始まり) */
  number: number;
  path: string;
  /** KanjiVG の kvg:type */
  type: string | undefined;
  end: [number, number];
  /** 自動推定した終わり方 */
  ending: Ending;
  /** 自動推定に自信がないときの理由 */
  reviewReason: string | undefined;
  /** 終わり方ごとの、終わるときの向き(終わり方によって向きを測る区間が変わるため) */
  directions: Record<Ending, Direction>;
}

export function analyzeKanji(kanji: string): StrokeAnalysis[] {
  const svg = readFileSync(
    path.join(KANJIVG.dir, "kanji", `${kanjiFileName(kanji)}.svg`),
    "utf8",
  );
  return parseKanjiVg(svg).map((source) => {
    const estimate = estimateEnding(source.type);
    const points = flattenPath(source.d);
    const end = endPoint(points);
    return {
      number: source.number,
      path: source.d,
      type: source.type,
      end: [roundCoordinate(end.x), roundCoordinate(end.y)],
      ending: estimate.ending,
      reviewReason: estimate.reviewReason,
      directions: Object.fromEntries(
        ENDINGS.map((ending) => [ending, endDirection(points, ending)]),
      ) as Record<Ending, Direction>,
    };
  });
}
