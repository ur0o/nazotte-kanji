import { z } from "zod";
import { difficultySchema, type Difficulty } from "./difficulty.ts";

const STORAGE_KEY = "kanji-kaki-quiz";
/** エンドレスと難易度選択で、出題を避ける直近の漢字の数 */
export const RECENT_LIMIT = 200;

const roundSchema = z.object({
  kanji: z.string(),
  difficulty: difficultySchema,
  guesses: z.array(z.string()),
});

const savedDataSchema = z.object({
  version: z.literal(1),
  /** 今日の1字の記録。キーは問題番号 */
  daily: z.record(z.string(), roundSchema),
  endlessBest: z.number().int().nonnegative(),
  levelBest: z.record(difficultySchema, z.number().int().nonnegative()),
  /** エンドレスと難易度選択で最近出した漢字(新しい順) */
  recent: z.array(z.string()),
});
export type SavedData = z.infer<typeof savedDataSchema>;

export function initialSavedData(): SavedData {
  return {
    version: 1,
    daily: {},
    endlessBest: 0,
    levelBest: { easy: 0, normal: 0, hard: 0 },
    recent: [],
  };
}

/** 保存した文字列を読む。壊れていたら初期値にする */
export function parseSavedData(raw: string | null): SavedData {
  if (raw === null) return initialSavedData();
  try {
    const result = savedDataSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : initialSavedData();
  } catch {
    return initialSavedData();
  }
}

export function loadSavedData(): SavedData {
  try {
    return parseSavedData(localStorage.getItem(STORAGE_KEY));
  } catch {
    return initialSavedData();
  }
}

export function updateSavedData(
  update: (data: SavedData) => SavedData,
): SavedData {
  const data = update(loadSavedData());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存できない環境(プライベートブラウズなど)では記録を残さずに続ける
  }
  return data;
}

export function addRecent(data: SavedData, kanji: string): SavedData {
  return {
    ...data,
    recent: [kanji, ...data.recent.filter((item) => item !== kanji)].slice(
      0,
      RECENT_LIMIT,
    ),
  };
}

/** 自己ベストを更新する。difficulty が null ならエンドレス */
export function recordBest(
  data: SavedData,
  difficulty: Difficulty | null,
  streak: number,
): SavedData {
  if (difficulty === null) {
    return { ...data, endlessBest: Math.max(data.endlessBest, streak) };
  }
  return {
    ...data,
    levelBest: {
      ...data.levelBest,
      [difficulty]: Math.max(data.levelBest[difficulty], streak),
    },
  };
}
