import { Loader } from "@mantine/core";
import { StrokeHints } from "../../components/StrokeHints.tsx";
import type { Difficulty } from "../../lib/difficulty.ts";
import type { Stroke } from "../../lib/kanji-data.ts";
import classes from "./Board.module.css";
import { DrawingCanvas, type DrawingLine } from "./DrawingCanvas.tsx";

export namespace Board {
  export interface Props {
    strokes: readonly Stroke[] | undefined;
    difficulty: Difficulty;
    lines: readonly DrawingLine[];
    onLinesChange: (lines: DrawingLine[]) => void;
  }
}

/** 上部の正方形エリア。手書きの線の上にヒントを重ねる */
export function Board({
  strokes,
  difficulty,
  lines,
  onLinesChange,
}: Board.Props) {
  return (
    <div className={classes.root}>
      <svg viewBox="0 0 109 109" className={classes.layer} aria-hidden>
        <line x1={54.5} y1={0} x2={54.5} y2={109} className={classes.guide} />
        <line x1={0} y1={54.5} x2={109} y2={54.5} className={classes.guide} />
      </svg>
      <div className={classes.canvas}>
        <DrawingCanvas lines={lines} onLinesChange={onLinesChange} />
      </div>
      {strokes ? (
        <StrokeHints
          strokes={strokes}
          difficulty={difficulty}
          className={classes.hints}
        />
      ) : (
        <div className={classes.loading}>
          <Loader size="sm" />
        </div>
      )}
    </div>
  );
}
