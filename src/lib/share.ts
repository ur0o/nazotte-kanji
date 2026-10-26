import { DIFFICULTY_LABELS } from "./difficulty.ts";
import { scoreLabel, type Round } from "./game.ts";

/** 今日の1字の結果をシェアする文章。答えの漢字は含めない */
export function dailyShareText(
  number: number,
  round: Round,
  url: string,
): string {
  return `今日の1字 #${number} ${DIFFICULTY_LABELS[round.difficulty]} ${scoreLabel(round)}\n${url}`;
}

export function xShareUrl(text: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
