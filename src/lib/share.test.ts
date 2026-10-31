import { describe, expect, it } from "vitest";
import { dailyShareText, endlessShareText, xShareUrl } from "./share.ts";

describe("dailyShareText", () => {
  it("結果・ハッシュタグ・リンクの順に書き、答えと問題番号は含めない", () => {
    const text = dailyShareText(
      { kanji: "森", difficulty: "hard", guesses: ["木", "林", "森"] },
      "https://example.com/",
    );
    expect(text).toBe(
      "今日の1文字 難しい 3/5\n#nazotte漢字\nhttps://example.com/",
    );
    expect(text).not.toContain("森");
  });
});

describe("endlessShareText", () => {
  it("難易度と連続正解数を書く", () => {
    expect(endlessShareText("oni", 12, "https://example.com/")).toBe(
      "エンドレス 鬼 連続正解 12\n#nazotte漢字\nhttps://example.com/",
    );
  });
});

describe("xShareUrl", () => {
  it("文章をエンコードして投稿画面の URL にする", () => {
    expect(xShareUrl("a b\n#1")).toBe(
      "https://x.com/intent/post?text=a%20b%0A%231",
    );
  });
});
