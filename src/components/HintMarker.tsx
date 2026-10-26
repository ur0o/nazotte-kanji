import type { Direction, Ending } from "../lib/kanji-data.ts";
import {
  ARROW_LENGTH,
  ARROW_START,
  DIRECTION_VECTORS,
} from "../lib/hint-layout.ts";

export namespace HintMarker {
  export interface Props {
    x: number;
    y: number;
    ending: Ending;
    direction: Direction;
  }
}

const ARROW_HEAD = 2;

function EndingSymbol({ ending }: { ending: Ending }) {
  switch (ending) {
    case "tome":
      return <circle r={2} fill="currentColor" />;
    case "hane":
      return (
        <path
          d="M-2.6,1.4 Q0,-3 2.6,1.4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      );
    case "harai":
      return <path d="M-1.8,-2.3 L2.6,0 L-1.8,2.3 Z" fill="currentColor" />;
  }
}

/** 1画分のヒント: 終点に置く終わり方の記号と、終わるときの向きを示す矢印 */
export function HintMarker({ x, y, ending, direction }: HintMarker.Props) {
  const vector = DIRECTION_VECTORS[direction];
  const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${angle})`}>
        <line
          x1={ARROW_START}
          x2={ARROW_LENGTH - ARROW_HEAD}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
        <path
          d={`M${ARROW_LENGTH},0 L${ARROW_LENGTH - ARROW_HEAD},-1.3 L${ARROW_LENGTH - ARROW_HEAD},1.3 Z`}
          fill="currentColor"
        />
      </g>
      <EndingSymbol ending={ending} />
    </g>
  );
}
