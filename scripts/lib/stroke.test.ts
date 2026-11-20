import { describe, expect, it } from "vitest";
import {
  endDirection,
  estimateEnding,
  isRisingStroke,
  MIN_END_SEPARATION,
  separatedEndPoints,
  pointBeforeEnd,
  toDirection,
} from "./stroke.ts";

describe("toDirection", () => {
  const origin = { x: 0, y: 0 };
  it.each([
    [{ x: 1, y: 0 }, "E"],
    [{ x: 1, y: 1 }, "SE"],
    [{ x: 0, y: 1 }, "S"],
    [{ x: -1, y: 1 }, "SW"],
    [{ x: -1, y: 0 }, "W"],
    [{ x: -1, y: -1 }, "NW"],
    [{ x: 0, y: -1 }, "N"],
    [{ x: 1, y: -1 }, "NE"],
    [{ x: 10, y: 3 }, "E"],
    [{ x: 10, y: 5 }, "SE"],
  ] as const)("%o は %s", (to, expected) => {
    expect(toDirection(origin, to)).toBe(expected);
  });
});

describe("pointBeforeEnd", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];

  it("折れ線を終点から指定した長さだけ遡る", () => {
    expect(pointBeforeEnd(points, 4)).toEqual({ x: 10, y: 6 });
    expect(pointBeforeEnd(points, 15)).toEqual({ x: 5, y: 0 });
  });

  it("線より長く遡るときは始点を返す", () => {
    expect(pointBeforeEnd(points, 100)).toEqual({ x: 0, y: 0 });
  });
});

describe("endDirection", () => {
  // 下に進んでから、最後に短く左上へ跳ね上げる線
  const hook = [
    { x: 50, y: 10 },
    { x: 50, y: 90 },
    { x: 47, y: 87 },
  ];

  it("はねは末端の跳ね上げの向きになる", () => {
    expect(endDirection(hook, "hane")).toBe("NW");
  });

  it("とめ・はらいは終わり付近の大まかな向きになる", () => {
    const sweep = [
      { x: 10, y: 10 },
      { x: 50, y: 50 },
      { x: 54, y: 51 },
    ];
    expect(endDirection(sweep, "harai")).toBe("SE");
    expect(endDirection(sweep, "hane")).toBe("E");
  });
});

describe("estimateEnding", () => {
  it.each([
    ["㇐", "tome"],
    ["㇑", "tome"],
    ["㇒", "harai"],
    ["㇏", "harai"],
    ["㇚", "hane"],
    ["㇆", "hane"],
  ] as const)("%s は %s", (type, ending) => {
    expect(estimateEnding(type)).toEqual({ ending });
  });

  it("英字の接尾辞は無視する", () => {
    expect(estimateEnding("㇑a")).toEqual({ ending: "tome" });
    expect(estimateEnding("㇆a")).toEqual({ ending: "hane" });
  });

  it("候補が複数で終わり方が違うときは、最初の候補を使い確認対象にする", () => {
    const estimate = estimateEnding("㇔/㇏");
    expect(estimate.ending).toBe("tome");
    expect(estimate.reviewReason).toContain("㇔/㇏");
  });

  it("候補が複数でも終わり方が同じなら確認対象にしない", () => {
    expect(estimateEnding("㇆/㇚")).toEqual({ ending: "hane" });
  });

  it("右上に跳ね上げる画(提)は、候補が複数でもはねにして確認対象にしない", () => {
    expect(estimateEnding("㇀")).toEqual({ ending: "hane" });
    expect(estimateEnding("㇀/㇐")).toEqual({ ending: "hane" });
    expect(estimateEnding("㇀/㇏")).toEqual({ ending: "hane" });
  });

  it("画の種類が未設定・未知のときは確認対象にする", () => {
    expect(estimateEnding(undefined).reviewReason).toBeDefined();
    expect(estimateEnding("X").reviewReason).toBeDefined();
  });
});

describe("isRisingStroke", () => {
  it("最初の候補が提(㇀)なら右上に跳ね上げる画とみなす", () => {
    expect(isRisingStroke("㇀")).toBe(true);
    expect(isRisingStroke("㇀/㇐")).toBe(true);
    expect(isRisingStroke("㇐/㇀")).toBe(false);
    expect(isRisingStroke("㇐")).toBe(false);
    expect(isRisingStroke(undefined)).toBe(false);
  });
});

describe("separatedEndPoints", () => {
  const vertical = [
    { x: 50, y: 10 },
    { x: 50, y: 50 },
  ];
  const horizontal = [
    { x: 10, y: 50 },
    { x: 50.5, y: 50 },
  ];

  it("ほぼ同じ位置で終わるとき、後の画のとめを線に沿って手前に戻す", () => {
    const [first, second] = separatedEndPoints([
      { points: vertical, ending: "tome" },
      { points: horizontal, ending: "tome" },
    ]);
    expect(first).toEqual({ x: 50, y: 50 });
    expect(second?.y).toBe(50);
    expect(second?.x).toBeLessThan(50);
    expect(Math.hypot(50 - (second?.x ?? 0), 0)).toBeGreaterThanOrEqual(
      MIN_END_SEPARATION,
    );
  });

  it("後の画がはね・はらいなら、先の画のとめを動かす", () => {
    const [first, second] = separatedEndPoints([
      { points: vertical, ending: "tome" },
      { points: horizontal, ending: "harai" },
    ]);
    expect(second).toEqual({ x: 50.5, y: 50 });
    expect(first?.x).toBe(50);
    expect(first?.y).toBeLessThan(50);
  });

  it("離れている終点は動かさない", () => {
    const far = [
      { x: 10, y: 90 },
      { x: 40, y: 90 },
    ];
    expect(
      separatedEndPoints([
        { points: vertical, ending: "tome" },
        { points: far, ending: "tome" },
      ]),
    ).toEqual([
      { x: 50, y: 50 },
      { x: 40, y: 90 },
    ]);
  });
});
