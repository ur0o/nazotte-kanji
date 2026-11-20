import { z } from "zod";

export const difficultySchema = z.enum(["normal", "hard", "oni"]);
export type Difficulty = z.infer<typeof difficultySchema>;

/** エンドレスで選べる難易度(全て) */
export const DIFFICULTIES: readonly Difficulty[] = difficultySchema.options;

/** 今日の1文字で選べる難易度。鬼はエンドレスだけ */
export const dailyDifficultySchema = difficultySchema.exclude(["oni"]);
export type DailyDifficulty = z.infer<typeof dailyDifficultySchema>;
export const DAILY_DIFFICULTIES: readonly DailyDifficulty[] =
  dailyDifficultySchema.options;

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  normal: "ふつう",
  hard: "難しい",
  oni: "鬼",
};

export interface DifficultyHints {
  /** 書き順の番号を表示するか */
  strokeNumbers: boolean;
  /** 終わるときの向き(矢印)を表示するか */
  arrows: boolean;
}

/** 難易度ごとに表示するヒント。終点の位置と終わり方はどの難易度でも表示する */
export const DIFFICULTY_HINTS: Readonly<Record<Difficulty, DifficultyHints>> = {
  normal: { strokeNumbers: true, arrows: true },
  hard: { strokeNumbers: true, arrows: false },
  oni: { strokeNumbers: false, arrows: false },
};
