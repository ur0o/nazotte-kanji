import { describe, expect, it } from "vitest";
import { dailyKanji, dailyNumber, msUntilNextDaily } from "./daily.ts";
import { DAILY_DIFFICULTIES } from "./difficulty.ts";

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

describe("dailyKanji", () => {
  const kanjiList = [..."一二三四五六七八九十百千"];

  it("同じ問題番号と難易度なら同じ漢字になる", () => {
    expect(dailyKanji(5, "normal", kanjiList)).toBe(
      dailyKanji(5, "normal", kanjiList),
    );
  });

  it("同じ日の2つの難易度で漢字が重ならない", () => {
    const today = DAILY_DIFFICULTIES.map((d) => dailyKanji(3, d, kanjiList));
    expect(new Set(today).size).toBe(2);
  });

  it("一覧を使い切るまで同じ漢字を出さず、使い切ったら最初に戻る", () => {
    const days = kanjiList.length / DAILY_DIFFICULTIES.length;
    const all = Array.from({ length: days }, (_, i) =>
      DAILY_DIFFICULTIES.map((d) => dailyKanji(i + 1, d, kanjiList)),
    ).flat();
    expect(new Set(all).size).toBe(kanjiList.length);
    expect(dailyKanji(days + 1, "normal", kanjiList)).toBe(all[0]);
  });
});
