import { DAILY_DIFFICULTIES, type DailyDifficulty } from "./difficulty.ts";
import { createRandom, shuffle } from "./random.ts";

/** 第1回の日付(日本時間)。この日を問題番号 1 とする */
export const LAUNCH_DATE = "2026-10-26";

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 出題順を決めるシード。変えると全員の出題順が変わるので、公開後は変えない */
const ORDER_SEED = 20261026;

/** 日本時間で数えた、1970-01-01 からの日数 */
function jstEpochDay(date: Date): number {
  return Math.floor((date.getTime() + JST_OFFSET_MS) / DAY_MS);
}

/** その時刻(日本時間)の問題番号。第1回より前は 1 にする */
export function dailyNumber(date: Date): number {
  const launchDay = jstEpochDay(new Date(`${LAUNCH_DATE}T00:00:00+09:00`));
  return Math.max(1, jstEpochDay(date) - launchDay + 1);
}

/** 次の問題に切り替わる(日本時間の 0 時になる)までのミリ秒 */
export function msUntilNextDaily(date: Date): number {
  const nextDay = jstEpochDay(date) + 1;
  return nextDay * DAY_MS - JST_OFFSET_MS - date.getTime();
}

/**
 * 問題番号と難易度から今日の1字を決める。
 * 常用漢字を固定のシードで並べ替え、先頭から2字ずつを1日分として ふつう・難しい の順に割り当てる。
 * 同じ日の2問で漢字は重ならない。一覧を使い切ったら最初に戻る。
 */
export function dailyKanji(
  number: number,
  difficulty: DailyDifficulty,
  kanjiList: readonly string[],
): string {
  if (kanjiList.length === 0) throw new Error("Kanji list is empty");
  const order = shuffle(kanjiList, createRandom(ORDER_SEED));
  const position =
    (number - 1) * DAILY_DIFFICULTIES.length +
    DAILY_DIFFICULTIES.indexOf(difficulty);
  return order[position % order.length] as string;
}
