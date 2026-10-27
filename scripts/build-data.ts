import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  kanjiFileName,
  kanjiIndexSchema,
  kanjiStrokesSchema,
  type KanjiEntry,
  type KanjiStrokes,
  type Stroke,
} from "../src/lib/kanji-data.ts";
import {
  analyzeKanji,
  assertSourcesFetched,
  loadJouyou,
  loadOverrides,
  ROOT,
  sortKanji,
  type Overrides,
} from "./lib/kanji-analysis.ts";
import { hiraganaToKatakana } from "./lib/readings.ts";

const OUTPUT_DIR = path.join(ROOT, "public/data");
const REVIEW_PATH = path.join(ROOT, "data/review-candidates.json");

interface ReviewCandidate {
  kanji: string;
  stroke: number;
  type: string | null;
  estimated: Stroke["ending"];
  reason: string;
}

function buildStrokes(
  kanji: string,
  overrides: Overrides,
  reviewCandidates: ReviewCandidate[],
): KanjiStrokes {
  const kanjiOverrides = overrides[kanji] ?? {};
  const strokes = analyzeKanji(kanji).map((analysis): Stroke => {
    const override = kanjiOverrides[String(analysis.number)];
    if (analysis.reviewReason && override?.ending === undefined) {
      reviewCandidates.push({
        kanji,
        stroke: analysis.number,
        type: analysis.type ?? null,
        estimated: analysis.ending,
        reason: analysis.reviewReason,
      });
    }
    const ending = override?.ending ?? analysis.ending;
    return {
      path: analysis.path,
      end: analysis.end,
      direction: override?.direction ?? analysis.directions[ending],
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
  assertSourcesFetched();
  const kanjiData = loadJouyou();
  const kanjiList = sortKanji(Object.keys(kanjiData));
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
