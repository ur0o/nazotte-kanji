import { z } from "zod";

export const difficultySchema = z.enum(["easy", "normal", "hard"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const DIFFICULTIES: readonly Difficulty[] = difficultySchema.options;

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: "易",
  normal: "普",
  hard: "難",
};

export interface DifficultyHints {
  /** 書き順の番号を表示するか */
  strokeNumbers: boolean;
  /** 終わるときの向き(矢印)を表示するか */
  arrows: boolean;
}

/** 難易度ごとに表示するヒント。終点の位置と終わり方はどの難易度でも表示する */
export const DIFFICULTY_HINTS: Readonly<Record<Difficulty, DifficultyHints>> = {
  easy: { strokeNumbers: true, arrows: true },
  normal: { strokeNumbers: true, arrows: false },
  hard: { strokeNumbers: false, arrows: false },
};

export const DIFFICULTY_DESCRIPTIONS: Readonly<Record<Difficulty, string>> = {
  easy: "書き順の番号と、終わるときの向き(矢印)が表示されます",
  normal: "書き順の番号だけが表示されます",
  hard: "書き順の番号も向きも表示されません",
};
