import { describe, expect, it } from "vitest";
import { showsStrokeNumber } from "./difficulty.ts";

describe("showsStrokeNumber", () => {
  const shown = (difficulty: "easy" | "normal" | "hard") =>
    [0, 1, 2, 3].filter((i) => showsStrokeNumber(difficulty, i, 4));

  it("易は全ての画、普は1画目と最後の画、難は表示なし", () => {
    expect(shown("easy")).toEqual([0, 1, 2, 3]);
    expect(shown("normal")).toEqual([0, 3]);
    expect(shown("hard")).toEqual([]);
  });
});
