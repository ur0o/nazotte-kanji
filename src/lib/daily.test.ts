import { describe, expect, it } from "vitest";
import { dailyNumber, dailyPuzzle, msUntilNextDaily } from "./daily.ts";

describe("dailyNumber", () => {
  it("第1回の日を 1 とし、日本時間の 0 時に切り替わる", () => {
    // 日本時間 2026-10-26 00:00 = UTC 2026-10-25 15:00
    expect(dailyNumber(new Date("2026-10-25T15:00:00Z"))).toBe(1);
    expect(dailyNumber(new Date("2026-10-26T14:59:59Z"))).toBe(1);
    expect(dailyNumber(new Date("2026-10-26T15:00:00Z"))).toBe(2);
    expect(dailyNumber(new Date("2027-10-26T00:00:00Z"))).toBe(366);
  });

  it("第1回より前は 1 にする", () => {
    expect(dailyNumber(new Date("2026-01-01T00:00:00Z"))).toBe(1);
  });
});

describe("msUntilNextDaily", () => {
  it("次の日本時間 0 時までの時間を返す", () => {
    expect(msUntilNextDaily(new Date("2026-10-26T14:59:59Z"))).toBe(1000);
    expect(msUntilNextDaily(new Date("2026-10-26T15:00:00Z"))).toBe(
      24 * 60 * 60 * 1000,
    );
  });
});

describe("dailyPuzzle", () => {
  const kanjiList = [..."一二三四五六七八九十"];

  it("同じ問題番号なら同じ問題になる", () => {
    expect(dailyPuzzle(5, kanjiList)).toEqual(dailyPuzzle(5, kanjiList));
  });

  it("一覧を使い切るまで同じ漢字を出さず、使い切ったら最初に戻る", () => {
    const first = kanjiList.map((_, i) => dailyPuzzle(i + 1, kanjiList).kanji);
    expect(new Set(first).size).toBe(kanjiList.length);
    expect(dailyPuzzle(kanjiList.length + 1, kanjiList).kanji).toBe(first[0]);
  });

  it("難易度は問題番号によって変わる", () => {
    const difficulties = new Set(
      Array.from(
        { length: 30 },
        (_, i) => dailyPuzzle(i + 1, kanjiList).difficulty,
      ),
    );
    expect(difficulties.size).toBe(3);
  });
});
