import { useMemo } from "react";
import { showsStrokeNumber, type Difficulty } from "../lib/difficulty.ts";
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

/** 全ての画の終点・終わり方・向きと、難易度に応じた書き順の番号を描く */
export function StrokeHints({
  strokes,
  difficulty,
  className,
}: StrokeHints.Props) {
  const labels = useMemo(
    () =>
      layoutStrokeLabels(strokes, (index) =>
        showsStrokeNumber(difficulty, index, strokes.length),
      ),
    [strokes, difficulty],
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
