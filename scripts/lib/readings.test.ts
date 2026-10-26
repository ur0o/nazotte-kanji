import { describe, expect, it } from "vitest";
import { hiraganaToKatakana } from "./readings.ts";

describe("hiraganaToKatakana", () => {
  it("ひらがなをカタカナにする", () => {
    expect(hiraganaToKatakana("しょう")).toBe("ショウ");
    expect(hiraganaToKatakana("ゔぁ")).toBe("ヴァ");
  });

  it("ひらがな以外はそのまま", () => {
    expect(hiraganaToKatakana("カン-ー.a")).toBe("カン-ー.a");
  });
});
