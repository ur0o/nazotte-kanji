import type { Stroke } from "../lib/kanji-data.ts";
import classes from "./StrokeAnimation.module.css";

export namespace StrokeAnimation {
  export interface Props {
    strokes: readonly Stroke[];
    /** 変えるとアニメーションを最初から再生する */
    playKey?: number;
  }
}

/** 1画ずつ書き順どおりに描くアニメーション */
export function StrokeAnimation({
  strokes,
  playKey = 0,
}: StrokeAnimation.Props) {
  return (
    <svg
      key={playKey}
      viewBox="0 0 109 109"
      className={classes.root}
      role="img"
    >
      {strokes.map((stroke, index) => (
        <path
          key={index}
          d={stroke.path}
          pathLength={1}
          className={classes.stroke}
          style={{ animationDelay: `${index * 0.55}s` }}
        />
      ))}
    </svg>
  );
}
