import { describe, expect, it } from "vitest";
import { DIFFICULTY_HINTS } from "./difficulty.ts";

describe("DIFFICULTY_HINTS", () => {
  it("易は番号と向き、普は番号だけ、難はどちらもなし", () => {
    expect(DIFFICULTY_HINTS).toEqual({
      easy: { strokeNumbers: true, arrows: true },
      normal: { strokeNumbers: true, arrows: false },
      hard: { strokeNumbers: false, arrows: false },
    });
  });
});
