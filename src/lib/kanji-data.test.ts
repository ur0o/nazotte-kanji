import { describe, expect, it } from "vitest";
import { kanjiFileName } from "./kanji-data.ts";

describe("kanjiFileName", () => {
  it("コードポイントの16進数5桁にする", () => {
    expect(kanjiFileName("漢")).toBe("06f22");
    expect(kanjiFileName("𠮟")).toBe("20b9f");
  });
});
