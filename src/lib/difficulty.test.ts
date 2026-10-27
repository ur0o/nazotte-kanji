import { describe, expect, it } from "vitest";
import {
  DAILY_DIFFICULTIES,
  DIFFICULTIES,
  DIFFICULTY_HINTS,
} from "./difficulty.ts";

describe("DIFFICULTY_HINTS", () => {
  it("ふつうは番号と向き、難しいは番号だけ、鬼はどちらもなし", () => {
    expect(DIFFICULTY_HINTS).toEqual({
      normal: { strokeNumbers: true, arrows: true },
      hard: { strokeNumbers: true, arrows: false },
      oni: { strokeNumbers: false, arrows: false },
    });
  });
});

describe("選べる難易度", () => {
  it("今日の1字は ふつう・難しい、エンドレスは鬼も選べる", () => {
    expect(DAILY_DIFFICULTIES).toEqual(["normal", "hard"]);
    expect(DIFFICULTIES).toEqual(["normal", "hard", "oni"]);
  });
});
