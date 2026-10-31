import { DIFFICULTY_LABELS, type Difficulty } from "./difficulty.ts";
import { scoreLabel, type Round } from "./game.ts";
import { MODE_LABELS } from "./modes.ts";

export const SHARE_HASHTAG = "#nazotte漢字";

/** 結果の1行の後に、ハッシュタグとページへのリンクを続ける */
function withFooter(result: string, url: string): string {
  return `${result}\n${SHARE_HASHTAG}\n${url}`;
}

/** 今日の1文字の結果をシェアする文章。答えの漢字は含めない */
export function dailyShareText(round: Round, url: string): string {
  return withFooter(
    `${MODE_LABELS.daily} ${DIFFICULTY_LABELS[round.difficulty]} ${scoreLabel(round)}`,
    url,
  );
}

/** エンドレスで不正解になったときにシェアする文章。答えの漢字は含めない */
export function endlessShareText(
  difficulty: Difficulty,
  streak: number,
  url: string,
): string {
  return withFooter(
    `${MODE_LABELS.endless} ${DIFFICULTY_LABELS[difficulty]} 連続正解 ${streak}`,
    url,
  );
}

export function xShareUrl(text: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
