import { describe, expect, it } from "vitest";
import { flattenPath } from "./svg-path.ts";

describe("flattenPath", () => {
  it("絶対座標の M と L を変換する", () => {
    expect(flattenPath("M10,20L30,40")).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ]);
  });

  it("相対座標と、M に続く座標の組を線として扱う", () => {
    expect(flattenPath("m10,20 5,5 h10 v-5")).toEqual([
      { x: 10, y: 20 },
      { x: 15, y: 25 },
      { x: 25, y: 25 },
      { x: 25, y: 20 },
    ]);
  });

  it("区切りのない負の数を読む", () => {
    const points = flattenPath("M15.41,89.2c1.46,0.43,2.88-0.03,3.59-1.24");
    expect(points.at(-1)?.x).toBeCloseTo(19);
    expect(points.at(-1)?.y).toBeCloseTo(87.96);
  });

  it("曲線を分割し、終点で終わる", () => {
    const points = flattenPath("M0,0C0,10,10,10,10,0");
    expect(points.length).toBeGreaterThan(2);
    expect(points.at(-1)).toEqual({ x: 10, y: 0 });
    // 曲線の中間点は y = 7.5
    expect(Math.max(...points.map((p) => p.y))).toBeCloseTo(7.5);
  });

  it("S は直前の制御点を反転して使う", () => {
    const withS = flattenPath("M0,0C0,10,10,10,10,0S20,-10,20,0");
    const withC = flattenPath("M0,0C0,10,10,10,10,0C10,-10,20,-10,20,0");
    expect(withS).toEqual(withC);
  });

  it("未対応のコマンドはエラーにする", () => {
    expect(() => flattenPath("M0,0A5,5,0,0,1,10,10")).toThrow();
  });
});
