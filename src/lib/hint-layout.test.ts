import { describe, expect, it } from "vitest";
import { layoutStrokeLabels } from "./hint-layout.ts";

describe("layoutStrokeLabels", () => {
  it("番号を表示しない画は undefined", () => {
    const labels = layoutStrokeLabels(
      [{ end: [50, 50], direction: "E" }],
      () => false,
    );
    expect(labels).toEqual([undefined]);
  });

  it("ほかに何もなければ矢印と反対側に置く", () => {
    const [label] = layoutStrokeLabels(
      [{ end: [50, 50], direction: "E" }],
      () => true,
    );
    expect(label?.x).toBeCloseTo(44.5);
    expect(label?.y).toBeCloseTo(50);
  });

  it("近くの終点と重なるときは別の位置にずらす", () => {
    const labels = layoutStrokeLabels(
      [
        { end: [50, 50], direction: "E" },
        { end: [44.5, 50], direction: "S" },
      ],
      () => true,
    );
    const [first, second] = labels;
    expect(first).toBeDefined();
    expect(
      Math.hypot((first?.x ?? 0) - 44.5, (first?.y ?? 0) - 50),
    ).toBeGreaterThan(4);
    expect(
      Math.hypot(
        (first?.x ?? 0) - (second?.x ?? 0),
        (first?.y ?? 0) - (second?.y ?? 0),
      ),
    ).toBeGreaterThan(4);
  });

  it("正方形の外にはみ出さない", () => {
    const [label] = layoutStrokeLabels(
      [{ end: [105, 50], direction: "W" }],
      () => true,
    );
    expect(label?.x).toBeLessThanOrEqual(106);
  });
});
