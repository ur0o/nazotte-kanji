import { describe, expect, it } from "vitest";
import {
  addRecent,
  initialSavedData,
  parseSavedData,
  recordEndlessBest,
  RECENT_LIMIT,
  saveDailyRound,
  type SavedRound,
} from "./storage.ts";

describe("parseSavedData", () => {
  it("保存がなければ初期値", () => {
    expect(parseSavedData(null)).toEqual(initialSavedData());
  });

  it("壊れていたり形式が古かったりしたら初期値", () => {
    expect(parseSavedData("{")).toEqual(initialSavedData());
    expect(parseSavedData('{"version":1,"daily":{},"endlessBest":0}')).toEqual(
      initialSavedData(),
    );
  });

  it("正しい形式なら読み込む", () => {
    const data = recordEndlessBest(initialSavedData(), "hard", 7);
    expect(parseSavedData(JSON.stringify(data))).toEqual(data);
  });
});

describe("addRecent", () => {
  it("新しい順に並べ、重複を除き、上限で切る", () => {
    let data = initialSavedData();
    for (let i = 0; i < RECENT_LIMIT + 5; i += 1)
      data = addRecent(data, String(i));
    data = addRecent(data, "10");
    expect(data.recent[0]).toBe("10");
    expect(data.recent).toHaveLength(RECENT_LIMIT);
    expect(data.recent.filter((k) => k === "10")).toHaveLength(1);
  });
});

describe("saveDailyRound", () => {
  it("難易度ごとに、問題番号をキーにして保存する", () => {
    const round: SavedRound = {
      kanji: "森",
      difficulty: "normal",
      guesses: ["木"],
    };
    const data = saveDailyRound(initialSavedData(), 3, round);
    expect(data.daily.normal["3"]).toEqual(round);
    expect(data.daily.easy).toEqual({});
  });
});

describe("recordEndlessBest", () => {
  it("難易度ごとに、自己ベストより大きいときだけ更新する", () => {
    const data = recordEndlessBest(initialSavedData(), "easy", 5);
    expect(recordEndlessBest(data, "easy", 3).endlessBest.easy).toBe(5);
    expect(recordEndlessBest(data, "hard", 2).endlessBest).toEqual({
      easy: 5,
      normal: 0,
      hard: 2,
    });
  });
});
