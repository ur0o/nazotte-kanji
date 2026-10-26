import { describe, expect, it } from "vitest";
import { dailyShareText, xShareUrl } from "./share.ts";

describe("dailyShareText", () => {
  it("答えを含めずに結果を書く", () => {
    const text = dailyShareText(
      123,
      { kanji: "森", difficulty: "normal", guesses: ["木", "林", "森"] },
      "https://example.com/",
    );
    expect(text).toBe("今日の1字 #123 普 3/5\nhttps://example.com/");
    expect(text).not.toContain("森");
  });
});

describe("xShareUrl", () => {
  it("文章をエンコードして投稿画面の URL にする", () => {
    expect(xShareUrl("a b\n#1")).toBe(
      "https://x.com/intent/post?text=a%20b%0A%231",
    );
  });
});
