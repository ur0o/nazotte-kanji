import { MAX_GUESSES } from "./answer.ts";
import type { Difficulty } from "./difficulty.ts";

export type GameStatus = "playing" | "won" | "lost";

export interface Round {
  kanji: string;
  difficulty: Difficulty;
  /** 回答した漢字(正解も含む)を回答順に並べたもの */
  guesses: string[];
  /** リタイアしたか。リタイアした問題は不正解として扱う */
  retired?: boolean;
}

export function roundStatus(round: Round): GameStatus {
  if (round.guesses.includes(round.kanji)) return "won";
  if (round.retired) return "lost";
  if (round.guesses.length >= MAX_GUESSES) return "lost";
  return "playing";
}

/** 回答を加えた新しい Round を返す。回答済みのときは何もしない */
export function addGuess(round: Round, guess: string): Round {
  if (roundStatus(round) !== "playing") return round;
  return { ...round, guesses: [...round.guesses, guess] };
}

/** リタイアした Round を返す。回答が終わった後は何もしない */
export function retire(round: Round): Round {
  if (roundStatus(round) !== "playing") return round;
  return { ...round, retired: true };
}

/** スコア表記。何回目で正解したか(例: 3/5)。不正解は ×/5 */
export function scoreLabel(round: Round): string {
  const status = roundStatus(round);
  if (status === "won") return `${round.guesses.length}/${MAX_GUESSES}`;
  if (status === "lost") return `×/${MAX_GUESSES}`;
  return `-/${MAX_GUESSES}`;
}
