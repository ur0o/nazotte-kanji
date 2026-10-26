import type { Direction, Ending } from "../../src/lib/kanji-data.ts";
import type { Point } from "./svg-path.ts";

/**
 * 終わるときの向きを求めるために、終点から遡る線の長さ。
 * はねは末端の短い跳ね上げの向きを、とめ・はらいは画の終わり付近の大まかな向きを取りたいので長さを変える。
 */
const END_DIRECTION_LENGTH: Readonly<Record<Ending, number>> = {
  tome: 8,
  hane: 3,
  harai: 8,
};

const DIRECTIONS: readonly Direction[] = [
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
  "N",
  "NE",
];

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** 折れ線を終点から length だけ遡った位置の点を返す */
export function pointBeforeEnd(
  points: readonly Point[],
  length: number,
): Point {
  let remaining = length;
  for (let i = points.length - 1; i > 0; i -= 1) {
    const to = points[i];
    const from = points[i - 1];
    if (!to || !from) break;
    const segment = distance(from, to);
    if (segment >= remaining && segment > 0) {
      const t = remaining / segment;
      return { x: to.x + (from.x - to.x) * t, y: to.y + (from.y - to.y) * t };
    }
    remaining -= segment;
  }
  const first = points[0];
  if (!first) throw new Error("Stroke has no points");
  return first;
}

/** 2点を結ぶ向きを8方向に丸める。SVG の座標系なので y は下向きが正 */
export function toDirection(from: Point, to: Point): Direction {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const index = Math.round(angle / (Math.PI / 4));
  const direction = DIRECTIONS[(index + 8) % 8];
  if (!direction) throw new Error(`Invalid angle: ${angle}`);
  return direction;
}

export function endPoint(points: readonly Point[]): Point {
  const last = points[points.length - 1];
  if (!last) throw new Error("Stroke has no points");
  return last;
}

export function endDirection(
  points: readonly Point[],
  ending: Ending,
): Direction {
  return toDirection(
    pointBeforeEnd(points, END_DIRECTION_LENGTH[ending]),
    endPoint(points),
  );
}

/**
 * KanjiVG の画の種類(CJK Strokes の文字)ごとの終わり方。
 * 日本の学校で教える字形を基準にしている。
 */
const ENDING_BY_STROKE_TYPE: Readonly<Record<string, Ending>> = {
  "㇀": "harai", // 提
  "㇁": "hane", // 彎鉤
  "㇂": "hane", // 斜鉤
  "㇃": "hane", // 臥鉤
  "㇄": "tome", // 竪彎
  "㇅": "tome", // 横折折
  "㇆": "hane", // 横折鉤
  "㇇": "harai", // 横撇
  "㇈": "hane", // 横折彎鉤
  "㇉": "hane", // 竪折彎鉤
  "㇊": "harai", // 横折提
  "㇋": "harai", // 横折折撇
  "㇌": "hane", // 横撇彎鉤
  "㇍": "tome", // 横折彎
  "㇎": "tome", // 横折折折
  "㇏": "harai", // 捺
  "㇐": "tome", // 横
  "㇑": "tome", // 竪
  "㇒": "harai", // 撇
  "㇓": "harai", // 竪撇
  "㇔": "tome", // 点
  "㇕": "tome", // 横折
  "㇖": "hane", // 横鉤
  "㇗": "tome", // 竪折
  "㇘": "tome", // 竪彎左
  "㇙": "hane", // 竪提
  "㇚": "hane", // 竪鉤
  "㇛": "tome", // 撇点
  "㇜": "tome", // 撇折
  "㇝": "harai", // 平捺
  "㇞": "tome", // 竪折折
  "㇟": "hane", // 竪彎鉤
  "㇠": "hane", // 横斜彎鉤
  "㇡": "hane", // 竪折折鉤
};

export interface EndingEstimate {
  ending: Ending;
  /** 自動推定に自信がなく、人の目で確認すべきときの理由 */
  reviewReason?: string;
}

/**
 * KanjiVG の kvg:type から終わり方を推定する。
 * "㇑a" のような英字の接尾辞は字形の違いを表すだけなので無視する。
 * "㇔/㇏" のように候補が複数あるときは最初の候補を使い、確認対象にする。
 */
export function estimateEnding(strokeType: string | undefined): EndingEstimate {
  if (!strokeType) {
    return { ending: "tome", reviewReason: "画の種類が未設定" };
  }
  const candidates = strokeType.split("/");
  const base = [...(candidates[0] ?? "")][0] ?? "";
  const ending = ENDING_BY_STROKE_TYPE[base];
  if (!ending) {
    return { ending: "tome", reviewReason: `未知の画の種類: ${strokeType}` };
  }
  if (candidates.length > 1) {
    const endings = new Set(
      candidates.map(
        (candidate) => ENDING_BY_STROKE_TYPE[[...candidate][0] ?? ""],
      ),
    );
    if (endings.size > 1) {
      return { ending, reviewReason: `画の種類の候補が複数: ${strokeType}` };
    }
  }
  return { ending };
}
