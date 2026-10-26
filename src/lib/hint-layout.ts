import type { Direction, Stroke } from "./kanji-data.ts";

export interface Vector {
  x: number;
  y: number;
}

/** 各方向の単位ベクトル。SVG の座標系なので y は下向きが正 */
export const DIRECTION_VECTORS: Readonly<Record<Direction, Vector>> = {
  E: { x: 1, y: 0 },
  SE: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  S: { x: 0, y: 1 },
  SW: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  W: { x: -1, y: 0 },
  NW: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
  N: { x: 0, y: -1 },
  NE: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
};

const ORDERED_DIRECTIONS: readonly Direction[] = [
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
  "N",
  "NE",
];

/** 記号の中心から矢印の根元までの距離(109×109 の座標系) */
export const ARROW_START = 3;
/** 記号の中心から矢印の先端までの距離 */
export const ARROW_LENGTH = 9;
/** 終点から番号ラベルの中心までの距離 */
const LABEL_DISTANCE = 5.5;
/** ラベルがほかの記号やラベルと重ならないとみなす距離 */
const LABEL_CLEARANCE = 4.5;
const VIEWBOX_SIZE = 109;
const VIEWBOX_MARGIN = 3;

function distance(a: Vector, b: Vector): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 矢印と反対側を最優先に、そこから近い向きの順でラベルの置き場所の候補を並べる */
function candidateDirections(arrow: Direction): Direction[] {
  const opposite = (ORDERED_DIRECTIONS.indexOf(arrow) + 4) % 8;
  const order = [0, 1, -1, 2, -2, 3, -3, 4];
  return order.map(
    (step) => ORDERED_DIRECTIONS[(opposite + step + 8) % 8] as Direction,
  );
}

function insideViewBox(point: Vector): boolean {
  return (
    point.x >= VIEWBOX_MARGIN &&
    point.y >= VIEWBOX_MARGIN &&
    point.x <= VIEWBOX_SIZE - VIEWBOX_MARGIN &&
    point.y <= VIEWBOX_SIZE - VIEWBOX_MARGIN
  );
}

/**
 * 書き順の番号ラベルを置く位置を決める。
 * 番号を表示しない画は undefined。記号・矢印・ほかのラベルとなるべく重ならない位置を選ぶ。
 * 矢印を表示するときは、矢印の反対側を優先する。
 */
export function layoutStrokeLabels(
  strokes: readonly Pick<Stroke, "end" | "direction">[],
  showNumber: (index: number) => boolean,
  showArrows: boolean,
): (Vector | undefined)[] {
  const obstacles: Vector[] = strokes.flatMap(({ end: [x, y], direction }) => {
    if (!showArrows) return [{ x, y }];
    const arrow = DIRECTION_VECTORS[direction];
    return [
      { x, y },
      {
        x: x + (arrow.x * ARROW_LENGTH) / 2,
        y: y + (arrow.y * ARROW_LENGTH) / 2,
      },
      { x: x + arrow.x * ARROW_LENGTH, y: y + arrow.y * ARROW_LENGTH },
    ];
  });
  const placed: Vector[] = [];

  return strokes.map(({ end: [x, y], direction }, index) => {
    if (!showNumber(index)) return undefined;
    let best: Vector | undefined;
    let bestClearance = -Infinity;
    for (const candidate of candidateDirections(direction)) {
      const offset = DIRECTION_VECTORS[candidate];
      const point = {
        x: x + offset.x * LABEL_DISTANCE,
        y: y + offset.y * LABEL_DISTANCE,
      };
      if (!insideViewBox(point)) continue;
      const clearance = Math.min(
        ...obstacles
          .filter((obstacle) => distance(obstacle, { x, y }) > 0.01)
          .map((obstacle) => distance(obstacle, point)),
        ...placed.map((label) => distance(label, point)),
      );
      if (clearance >= LABEL_CLEARANCE) {
        best = point;
        break;
      }
      if (clearance > bestClearance) {
        best = point;
        bestClearance = clearance;
      }
    }
    const label = best ?? { x, y };
    placed.push(label);
    return label;
  });
}
