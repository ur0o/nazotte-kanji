import { describe, expect, it } from "vitest";
import { layoutStrokeLabels } from "./hint-layout.ts";
import type { Stroke } from "./kanji-data.ts";

describe("layoutStrokeLabels", () => {
  it("番号を表示しない画は undefined", () => {
    const labels = layoutStrokeLabels(
      [{ end: [50, 50], direction: "E" }],
      () => false,
      true,
    );
    expect(labels).toEqual([undefined]);
  });

  it("ほかに何もなければ矢印と反対側に置く", () => {
    const [label] = layoutStrokeLabels(
      [{ end: [50, 50], direction: "E" }],
      () => true,
      true,
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
      true,
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
      true,
    );
    expect(label?.x).toBeLessThanOrEqual(106);
  });

  it("矢印を表示しないときは、矢印のあった位置にもラベルを置ける", () => {
    // 1画目の矢印(東向き)が、2画目の番号の第一候補(真下)にかかる配置
    const strokes: Pick<Stroke, "end" | "direction">[] = [
      { end: [50, 50], direction: "E" },
      { end: [56, 44], direction: "N" },
    ];
    const onlySecond = (index: number) => index === 1;
    const [, withArrows] = layoutStrokeLabels(strokes, onlySecond, true);
    const [, withoutArrows] = layoutStrokeLabels(strokes, onlySecond, false);
    expect(withoutArrows).toEqual({ x: 56, y: 49.5 });
    expect(withArrows).not.toEqual({ x: 56, y: 49.5 });
  });
});
