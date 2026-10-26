import { describe, expect, it } from "vitest";
import {
  displayKunReadings,
  formatKunReading,
  formatReadings,
} from "./readings.ts";

describe("formatKunReading", () => {
  it.each([
    ["あ.がる", "あ(がる)"],
    ["-あ.がる", "-あ(がる)"],
    ["ひと-", "ひと-"],
    ["うえ", "うえ"],
  ])("%s → %s", (reading, expected) => {
    expect(formatKunReading(reading)).toBe(expected);
  });
});

describe("formatReadings", () => {
  it("重複を除いて ・ で区切る", () => {
    expect(formatReadings(["うえ", "うわ-", "うえ"])).toBe("うえ・うわ-");
  });
});

describe("displayKunReadings", () => {
  it("接頭語・接尾語としての読みは、ほかの読みがあれば省く", () => {
    expect(displayKunReadings(["こ", "-こ", "-っこ"])).toEqual(["こ"]);
    expect(displayKunReadings(["あ.がる", "-あ.がる"])).toEqual(["あ(がる)"]);
  });

  it("接頭語・接尾語の読みしかなければ、それを表示する", () => {
    expect(displayKunReadings(["ひと-"])).toEqual(["ひと-"]);
  });
});
