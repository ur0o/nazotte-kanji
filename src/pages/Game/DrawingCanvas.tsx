import { useEffect, useRef, type PointerEvent } from "react";
import classes from "./DrawingCanvas.module.css";

export interface DrawingPoint {
  x: number;
  y: number;
}
export type DrawingLine = DrawingPoint[];

export namespace DrawingCanvas {
  export interface Props {
    /** 書いた線。座標は KanjiVG と同じ 109×109 の座標系 */
    lines: readonly DrawingLine[];
    onLinesChange: (lines: DrawingLine[]) => void;
    disabled?: boolean;
  }
}

const VIEWBOX_SIZE = 109;
const LINE_WIDTH = 3;

function drawLine(
  context: CanvasRenderingContext2D,
  line: DrawingLine,
  scale: number,
): void {
  const [first, ...rest] = line;
  if (!first) return;
  context.beginPath();
  context.moveTo(first.x * scale, first.y * scale);
  // 点を打っただけのときも見えるよう、同じ位置への線を引く
  if (rest.length === 0) context.lineTo(first.x * scale, first.y * scale);
  for (const point of rest) context.lineTo(point.x * scale, point.y * scale);
  context.stroke();
}

/** マウスやタッチで線を書けるメモ用のキャンバス */
export function DrawingCanvas({
  lines,
  onLinesChange,
  disabled = false,
}: DrawingCanvas.Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLine = useRef<DrawingLine | null>(null);
  const linesRef = useRef(lines);

  const redraw = (): void => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const scale = canvas.width / VIEWBOX_SIZE;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = getComputedStyle(canvas).color;
    context.lineWidth = LINE_WIDTH * scale;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const line of linesRef.current) drawLine(context, line, scale);
    if (currentLine.current) drawLine(context, currentLine.current, scale);
  };

  useEffect(() => {
    linesRef.current = lines;
    redraw();
  });

  // 表示サイズと画面の解像度に合わせてキャンバスの大きさを変える
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const size = Math.round(
        entry.contentRect.width * window.devicePixelRatio,
      );
      canvas.width = size;
      canvas.height = size;
      redraw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const toPoint = (event: PointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_SIZE,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>): void => {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    currentLine.current = [toPoint(event)];
    redraw();
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>): void => {
    if (!currentLine.current || !event.isPrimary) return;
    currentLine.current.push(toPoint(event));
    redraw();
  };

  const finishLine = (): void => {
    const line = currentLine.current;
    if (!line) return;
    currentLine.current = null;
    onLinesChange([...linesRef.current, line]);
  };

  return (
    <canvas
      ref={canvasRef}
      className={classes.root}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishLine}
      onPointerCancel={finishLine}
      // 長押しで出るメニュー(画像の保存など)を出さない
      onContextMenu={(event) => event.preventDefault()}
      aria-label="メモ用の手書きエリア"
    />
  );
}
