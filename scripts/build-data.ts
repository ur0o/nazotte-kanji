import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  directionSchema,
  endingSchema,
  kanjiFileName,
  kanjiIndexSchema,
  kanjiStrokesSchema,
  type KanjiEntry,
  type KanjiStrokes,
  type Stroke,
} from "../src/lib/kanji-data.ts";
import { parseKanjiVg } from "./lib/kanjivg.ts";
import { hiraganaToKatakana } from "./lib/readings.ts";
import { endDirection, endPoint, estimateEnding } from "./lib/stroke.ts";
import { flattenPath } from "./lib/svg-path.ts";
import { KANJI_DATA, KANJIVG, SOURCES } from "./sources.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public/data");
const OVERRIDES_PATH = path.join(ROOT, "data/overrides.json");
const REVIEW_PATH = path.join(ROOT, "data/review-candidates.json");

const kanjiDataSchema = z.record(
  z.string(),
  z.object({
    readings_on: z.array(z.string()),
    readings_kun: z.array(z.string()),
  }),
);

/** { "漢": { "3": { "ending": "hane" } } } のように、漢字と書き順の番号で指定する */
const overridesSchema = z.record(
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
type Overrides = z.infer<typeof overridesSchema>;

interface ReviewCandidate {
  kanji: string;
  stroke: number;
  type: string | null;
  estimated: Stroke["ending"];
  reason: string;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}

function loadOverrides(): Overrides {
  if (!existsSync(OVERRIDES_PATH)) return {};
  return overridesSchema.parse(
    JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")),
  );
}

function buildStrokes(
  kanji: string,
  overrides: Overrides,
  reviewCandidates: ReviewCandidate[],
): KanjiStrokes {
  const svg = readFileSync(
    path.join(KANJIVG.dir, "kanji", `${kanjiFileName(kanji)}.svg`),
    "utf8",
  );
  const kanjiOverrides = overrides[kanji] ?? {};
  const strokes = parseKanjiVg(svg).map((source): Stroke => {
    const override = kanjiOverrides[String(source.number)];
    const estimate = estimateEnding(source.type);
    if (estimate.reviewReason && override?.ending === undefined) {
      reviewCandidates.push({
        kanji,
        stroke: source.number,
        type: source.type ?? null,
        estimated: estimate.ending,
        reason: estimate.reviewReason,
      });
    }
    const ending = override?.ending ?? estimate.ending;
    const points = flattenPath(source.d);
    const end = endPoint(points);
    return {
      path: source.d,
      end: [roundCoordinate(end.x), roundCoordinate(end.y)],
      direction: override?.direction ?? endDirection(points, ending),
      ending,
    };
  });

  for (const strokeNumber of Object.keys(kanjiOverrides)) {
    if (Number(strokeNumber) > strokes.length) {
      throw new Error(
        `overrides.json: 「${kanji}」に${strokeNumber}画目はありません`,
      );
    }
  }
  return kanjiStrokesSchema.parse({ kanji, strokes });
}

function main(): void {
  for (const source of SOURCES) {
    if (!existsSync(source.dir)) {
      throw new Error(
        `${source.name} がありません。先に pnpm data:fetch を実行してください`,
      );
    }
  }

  const kanjiData = kanjiDataSchema.parse(
    JSON.parse(
      readFileSync(path.join(KANJI_DATA.dir, "kanji-jouyou.json"), "utf8"),
    ),
  );
  const kanjiList = Object.keys(kanjiData).sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
  );
  const overrides = loadOverrides();
  for (const kanji of Object.keys(overrides)) {
    if (!(kanji in kanjiData)) {
      throw new Error(`overrides.json: 「${kanji}」は常用漢字ではありません`);
    }
  }

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(path.join(OUTPUT_DIR, "kanji"), { recursive: true });

  const reviewCandidates: ReviewCandidate[] = [];
  const entries: KanjiEntry[] = [];
  let strokeCount = 0;
  for (const kanji of kanjiList) {
    const strokes = buildStrokes(kanji, overrides, reviewCandidates);
    strokeCount += strokes.strokes.length;
    writeFileSync(
      path.join(OUTPUT_DIR, "kanji", `${kanjiFileName(kanji)}.json`),
      JSON.stringify(strokes),
    );
    const readings = kanjiData[kanji];
    entries.push({
      kanji,
      on: (readings?.readings_on ?? []).map(hiraganaToKatakana),
      kun: readings?.readings_kun ?? [],
    });
  }

  writeFileSync(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(kanjiIndexSchema.parse({ kanji: entries })),
  );
  writeFileSync(REVIEW_PATH, `${JSON.stringify(reviewCandidates, null, 2)}\n`);

  console.log(
    `${entries.length}字 / ${strokeCount}画を ${path.relative(ROOT, OUTPUT_DIR)} に出力`,
  );
  console.log(
    `確認が必要な画: ${reviewCandidates.length}件 (${path.relative(ROOT, REVIEW_PATH)})`,
  );
}

main();
