import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { MAX_GUESSES } from "../lib/answer.ts";
import { HintMarker } from "./HintMarker.tsx";
import classes from "./HowToModal.module.css";
import { SymbolGuide } from "./SymbolGuide.tsx";

export namespace HowToModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
  }
}

/** スワイプとみなす横方向の移動量(px) */
const SWIPE_THRESHOLD = 50;

/** 手書きのメモの線(正方形の座標 109×109) */
const MEMO_PATH =
  "M28,32 C40,30 60,29 80,28 M52,14 C53,40 52,70 50,94 M24,60 C40,58 64,57 86,56";

/** 正方形のヒント(手書きのメモの上に重なる) */
function SquareHints() {
  return (
    <>
      <path d={MEMO_PATH} className={classes.memo} />
      <HintMarker x={80} y={28} ending="tome" direction="E" showArrow />
      <HintMarker x={50} y={94} ending="hane" direction="NW" showArrow />
      <HintMarker x={86} y={56} ending="tome" direction="E" showArrow />
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
          正方形には、漢字の各画が終わる位置にヒントの記号が表示されます。指やマウスでメモも書けます。
        </Text>
        <Text size="sm">
          下の入力欄に漢字を1文字入れて回答します。回答は{MAX_GUESSES}
          回までできます。
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
