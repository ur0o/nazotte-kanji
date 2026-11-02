import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { MAX_GUESSES } from "../lib/answer.ts";
import type { Stroke } from "../lib/kanji-data.ts";
import classes from "./HowToModal.module.css";
import { StrokeHints } from "./StrokeHints.tsx";
import { SymbolGuide } from "./SymbolGuide.tsx";

export namespace HowToModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
  }
}

/** スワイプとみなす横方向の移動量(px) */
const SWIPE_THRESHOLD = 50;

/** 例に使う「手」の各画(public/data/kanji/0624b.json と同じ内容) */
const EXAMPLE_STROKES: readonly Stroke[] = [
  {
    path: "M61.48,11.5c0.02,1-0.61,1.88-1.67,2.9c-3.27,3.15-13.69,8.23-28.57,11.85",
    end: [31.2, 26.3],
    direction: "W",
    ending: "harai",
  },
  {
    path: "M26.38,42.92c1.8,0.46,3.61,0.67,5.68,0.38C46,41.38,58.4,39,71.37,37.75c1.92-0.19,4.62-0.38,7.25,0.04",
    end: [78.6, 37.8],
    direction: "E",
    ending: "tome",
  },
  {
    path: "M13.27,62.87c2.71,0.63,4.86,0.6,7.22,0.38c22.63-2.12,46.13-5.62,67.7-7c2.01-0.13,4.83,0,7.46,0.37",
    end: [95.6, 56.6],
    direction: "E",
    ending: "tome",
  },
  {
    path: "M48.88,23.55C60.38,31,62.73,63.66,57.83,89.87c-2.08,11.13-8.64,2.34-9.89,1.17",
    end: [47.9, 91],
    direction: "NW",
    ending: "hane",
  },
];

/** 正方形の例。手書きのメモ(灰色の線)の上に、ふつうの難易度のヒントが重なる */
function SquareHints() {
  return (
    <>
      {EXAMPLE_STROKES.map((stroke) => (
        <path key={stroke.path} d={stroke.path} className={classes.memo} />
      ))}
      <StrokeHints strokes={EXAMPLE_STROKES} difficulty="normal" />
    </>
  );
}

/** 正方形と、その下の入力欄の図 */
function OverviewDiagram() {
  return (
    <svg viewBox="0 0 120 142" className={classes.diagram} aria-hidden>
      <rect
        x={6}
        y={2}
        width={108}
        height={108}
        rx={2}
        className={classes.frame}
      />
      <svg x={6} y={2} width={108} height={108} viewBox="0 0 109 109">
        <SquareHints />
      </svg>
      <rect
        x={6}
        y={118}
        width={78}
        height={18}
        rx={2}
        className={classes.frame}
      />
      <text x={12} y={130} className={classes.placeholder}>
        漢字を1文字
      </text>
      <rect
        x={88}
        y={118}
        width={26}
        height={18}
        rx={2}
        className={classes.answerButton}
      />
      <text x={101} y={130} className={classes.buttonText} textAnchor="middle">
        回答
      </text>
    </svg>
  );
}

interface Page {
  /** ページ送りの点の読み上げに使う名前(画面には表示しない) */
  label: string;
  body: ReactNode;
}

const PAGES: readonly Page[] = [
  {
    label: "ヒントと回答",
    body: (
      <Stack gap="sm">
        <OverviewDiagram />
        <Text size="sm">
          漢字の各画が終わる位置にヒントの記号が表示されます。また、タップやマウスでメモを書けます。
        </Text>
        <Text size="sm">
          答えがわかったら、下の入力欄で回答してください。{MAX_GUESSES}回まで回答可能です。
        </Text>
      </Stack>
    ),
  },
  {
    label: "記号の意味",
    body: <SymbolGuide />,
  },
];

/** モーダルを開くたびに作り直されるので、ページは毎回1ページ目から始まる */
function HowToCarousel({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0);
  // スライドの向き。最初の表示ではアニメーションしない
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const swipeStart = useRef<number | null>(null);
  const isLast = page === PAGES.length - 1;
  const current = PAGES[page] as Page;

  const go = (next: number) => {
    const target = Math.min(PAGES.length - 1, Math.max(0, next));
    if (target === page) return;
    setDirection(target > page ? "next" : "prev");
    setPage(target);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (dx <= -SWIPE_THRESHOLD) go(page + 1);
    if (dx >= SWIPE_THRESHOLD) go(page - 1);
  };

  return (
    <Stack gap="md">
      <div
        className={classes.page}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        aria-live="polite"
      >
        <div
          key={page}
          className={
            direction === "next"
              ? classes.fromRight
              : direction === "prev"
                ? classes.fromLeft
                : undefined
          }
        >
          {current.body}
        </div>
      </div>
      <Group justify="center" gap={8} role="group" aria-label="ページ">
        {PAGES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={classes.dot}
            aria-current={index === page ? "step" : undefined}
            aria-label={`${index + 1}ページ目: ${item.label}`}
            onClick={() => go(index)}
          />
        ))}
      </Group>
      <Group grow>
        <Button
          variant="default"
          disabled={page === 0}
          onClick={() => go(page - 1)}
        >
          前へ
        </Button>
        {isLast ? (
          <Button onClick={onClose}>はじめる</Button>
        ) : (
          <Button onClick={() => go(page + 1)}>次へ</Button>
        )}
      </Group>
    </Stack>
  );
}

/** 遊び方の説明。2ページのカルーセル */
export function HowToModal({ opened, onClose }: HowToModal.Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="遊び方" centered>
      <HowToCarousel onClose={onClose} />
    </Modal>
  );
}
