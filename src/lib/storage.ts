import { z } from "zod";
import { difficultySchema, type Difficulty } from "./difficulty.ts";

const STORAGE_KEY = "kanji-kaki-quiz";
/** エンドレスで出題を避ける直近の漢字の数 */
export const RECENT_LIMIT = 200;

const roundSchema = z.object({
  kanji: z.string(),
  difficulty: difficultySchema,
  guesses: z.array(z.string()),
});

/** 難易度ごとの値 */
function byDifficulty<T extends z.ZodType>(schema: T) {
  return z.object({ easy: schema, normal: schema, hard: schema });
}

const savedDataSchema = z.object({
  version: z.literal(2),
  /** 今日の1字の記録。難易度ごとに、問題番号をキーにする */
  daily: byDifficulty(z.record(z.string(), roundSchema)),
  /** エンドレスの自己ベスト(連続正解数) */
  endlessBest: byDifficulty(z.number().int().nonnegative()),
  /** エンドレスで最近出した漢字(新しい順) */
  recent: z.array(z.string()),
});
export type SavedData = z.infer<typeof savedDataSchema>;
export type SavedRound = z.infer<typeof roundSchema>;

export function initialSavedData(): SavedData {
  return {
    version: 2,
    daily: { easy: {}, normal: {}, hard: {} },
    endlessBest: { easy: 0, normal: 0, hard: 0 },
    recent: [],
  };
}

/** 保存した文字列を読む。壊れていたり形式が古かったりしたら初期値にする */
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

export function saveDailyRound(
  data: SavedData,
  number: number,
  round: SavedRound,
): SavedData {
  const difficulty = round.difficulty;
  return {
    ...data,
    daily: {
      ...data.daily,
      [difficulty]: { ...data.daily[difficulty], [String(number)]: round },
    },
  };
}

/** エンドレスの自己ベストを、より大きいときだけ更新する */
export function recordEndlessBest(
  data: SavedData,
  difficulty: Difficulty,
  streak: number,
): SavedData {
  return {
    ...data,
    endlessBest: {
      ...data.endlessBest,
      [difficulty]: Math.max(data.endlessBest[difficulty], streak),
    },
  };
}
