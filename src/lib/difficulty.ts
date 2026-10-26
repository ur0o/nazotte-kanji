import { z } from "zod";

export const difficultySchema = z.enum(["easy", "normal", "hard"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const DIFFICULTIES: readonly Difficulty[] = difficultySchema.options;

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: "易",
  normal: "普",
  hard: "難",
};

export const DIFFICULTY_DESCRIPTIONS: Readonly<Record<Difficulty, string>> = {
  easy: "全ての画に書き順の番号が付きます",
  normal: "1画目と最後の画にだけ書き順の番号が付きます",
  hard: "書き順の番号は付きません",
};

/** index 画目(0始まり)の終点に書き順の番号を表示するか */
export function showsStrokeNumber(
  difficulty: Difficulty,
  index: number,
  strokeCount: number,
): boolean {
  switch (difficulty) {
    case "easy":
      return true;
    case "normal":
      return index === 0 || index === strokeCount - 1;
    case "hard":
      return false;
  }
}
