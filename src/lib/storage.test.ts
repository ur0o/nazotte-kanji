import { describe, expect, it } from "vitest";
import {
  addRecent,
  initialSavedData,
  parseSavedData,
  recordBest,
  RECENT_LIMIT,
} from "./storage.ts";

describe("parseSavedData", () => {
  it("保存がなければ初期値", () => {
    expect(parseSavedData(null)).toEqual(initialSavedData());
  });

  it("壊れていたら初期値", () => {
    expect(parseSavedData("{")).toEqual(initialSavedData());
    expect(parseSavedData('{"version":2}')).toEqual(initialSavedData());
  });

  it("正しい形式なら読み込む", () => {
    const data = { ...initialSavedData(), endlessBest: 7 };
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

describe("recordBest", () => {
  it("自己ベストより大きいときだけ更新する", () => {
    const data = recordBest(initialSavedData(), null, 5);
    expect(recordBest(data, null, 3).endlessBest).toBe(5);
    expect(recordBest(data, "hard", 2).levelBest.hard).toBe(2);
  });
});
