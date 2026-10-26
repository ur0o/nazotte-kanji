import { describe, expect, it } from "vitest";
import { validateAnswer } from "./answer.ts";

describe("validateAnswer", () => {
  const jouyou = new Set(["木", "林", "森"]);

  it("常用漢字1文字なら受け付ける(前後の空白は無視)", () => {
    expect(validateAnswer("木", jouyou, [])).toBeUndefined();
    expect(validateAnswer(" 林 ", jouyou, [])).toBeUndefined();
  });

  it.each(["", "木林", "き", "A", "叱", "𠮟"])(
    "%j は常用漢字1文字ではない",
    (input) => {
      expect(validateAnswer(input, jouyou, [])).toBe("notJouyouKanji");
    },
  );

  it("回答済みの漢字は受け付けない", () => {
    expect(validateAnswer("森", jouyou, ["木", "森"])).toBe("alreadyGuessed");
  });
});
