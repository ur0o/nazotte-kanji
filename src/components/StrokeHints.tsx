import { useMemo } from "react";
import { DIFFICULTY_HINTS, type Difficulty } from "../lib/difficulty.ts";
import { layoutStrokeLabels } from "../lib/hint-layout.ts";
import type { Stroke } from "../lib/kanji-data.ts";
import { HintMarker } from "./HintMarker.tsx";
import classes from "./StrokeHints.module.css";

export namespace StrokeHints {
  export interface Props {
    strokes: readonly Stroke[];
    difficulty: Difficulty;
    className?: string;
  }
}

/** 全ての画の終点と終わり方、難易度に応じて書き順の番号と向きを描く */
export function StrokeHints({
  strokes,
  difficulty,
  className,
}: StrokeHints.Props) {
  const hints = DIFFICULTY_HINTS[difficulty];
  const labels = useMemo(
    () => layoutStrokeLabels(strokes, () => hints.strokeNumbers, hints.arrows),
    [strokes, hints],
  );

  return (
    <svg
      viewBox="0 0 109 109"
      className={`${classes.root} ${className ?? ""}`}
      aria-hidden
    >
      {strokes.map((stroke, index) => (
        <HintMarker
          key={index}
          x={stroke.end[0]}
          y={stroke.end[1]}
          ending={stroke.ending}
          direction={stroke.direction}
          showArrow={hints.arrows}
        />
      ))}
      {labels.map(
        (label, index) =>
          label && (
            <text key={index} x={label.x} y={label.y} className={classes.label}>
              {index + 1}
            </text>
          ),
      )}
    </svg>
  );
}
