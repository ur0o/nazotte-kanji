export const MAX_GUESSES = 5;

export type AnswerError = "notJouyouKanji" | "alreadyGuessed";

export const ANSWER_ERROR_MESSAGES: Readonly<Record<AnswerError, string>> = {
  notJouyouKanji: "常用漢字を1文字入力してください",
  alreadyGuessed: "その漢字は回答済みです",
};

/**
 * 回答として受け付けられるか調べる。受け付けられないときは理由を返す。
 * 受け付けられない回答では回答回数を減らさない。
 */
export function validateAnswer(
  input: string,
  jouyou: ReadonlySet<string>,
  guesses: readonly string[],
): AnswerError | undefined {
  const answer = input.trim();
  if ([...answer].length !== 1 || !jouyou.has(answer)) return "notJouyouKanji";
  if (guesses.includes(answer)) return "alreadyGuessed";
  return undefined;
}
