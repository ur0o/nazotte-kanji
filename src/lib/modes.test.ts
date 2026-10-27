import { describe, expect, it } from "vitest";
import { modeOfPath } from "./modes.ts";

describe("modeOfPath", () => {
  it("ゲーム画面のパスからモードを返す", () => {
    expect(modeOfPath("/daily/hard")).toBe("daily");
    expect(modeOfPath("/endless/oni")).toBe("endless");
  });

  it("ゲーム画面でなければ undefined", () => {
    expect(modeOfPath("/")).toBeUndefined();
    expect(modeOfPath("/dailyx")).toBeUndefined();
  });
});
