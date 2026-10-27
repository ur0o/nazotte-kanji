import { Button, Group, List, Modal, Stack, Text, Title } from "@mantine/core";
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

/** 模式図の番号 */
function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={5} className={classes.badge} />
      <text className={classes.badgeText}>{n}</text>
    </g>
  );
}

/** ゲーム画面の模式図。番号は説明の一覧と対応する */
function ScreenDiagram() {
  return (
    <svg viewBox="0 0 132 178" className={classes.diagram} aria-hidden>
      {/* 1. 情報バー */}
      <text x={16} y={11} className={classes.diagramText}>
        12画
      </text>
      <rect
        x={100}
        y={4}
        width={22}
        height={10}
        rx={5}
        className={classes.fill}
      />
      <text
        x={111}
        y={11.5}
        className={classes.diagramSmall}
        textAnchor="middle"
      >
        ふつう
      </text>
      <Badge x={7} y={9} n={1} />
      {/* 2. 正方形のエリア */}
      <rect
        x={14}
        y={18}
        width={108}
        height={108}
        rx={2}
        className={classes.frame}
      />
      <line x1={68} y1={18} x2={68} y2={126} className={classes.guide} />
      <line x1={14} y1={72} x2={122} y2={72} className={classes.guide} />
      <svg x={14} y={18} width={108} height={108} viewBox="0 0 109 109">
        <HintMarker x={30} y={30} ending="tome" direction="E" showArrow />
        <HintMarker x={75} y={48} ending="hane" direction="NW" showArrow />
        <HintMarker x={35} y={88} ending="harai" direction="SW" showArrow />
      </svg>
      <Badge x={7} y={72} n={2} />
      {/* 3. 手書きツール */}
      <rect
        x={76}
        y={130}
        width={21}
        height={8}
        rx={2}
        className={classes.frame}
      />
      <rect
        x={100}
        y={130}
        width={22}
        height={8}
        rx={2}
        className={classes.frame}
      />
      <Badge x={7} y={134} n={3} />
      {/* 4. 回答履歴 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={14 + i * 15}
          y={142}
          width={13}
          height={13}
          rx={2}
          className={classes.frame}
        />
      ))}
      <text
        x={20.5}
        y={151.5}
        className={classes.diagramText}
        textAnchor="middle"
      >
        木
      </text>
      <Badge x={7} y={148.5} n={4} />
      {/* 5. 入力欄 */}
      <rect
        x={14}
        y={160}
        width={84}
        height={13}
        rx={2}
        className={classes.frame}
      />
      <rect
        x={101}
        y={160}
        width={21}
        height={13}
        rx={2}
        className={classes.fill}
      />
      <Badge x={7} y={166.5} n={5} />
    </svg>
  );
}

/** 手書きの上にヒントが重なる様子 */
function MemoDiagram() {
  return (
    <svg viewBox="0 0 109 109" className={classes.square} aria-hidden>
      <path
        d="M28,32 C40,30 60,29 80,28 M52,14 C53,40 52,70 50,94 M24,60 C40,58 64,57 86,56"
        className={classes.memo}
      />
      <HintMarker x={80} y={28} ending="tome" direction="E" showArrow />
      <HintMarker x={50} y={94} ending="hane" direction="NW" showArrow />
      <HintMarker x={86} y={56} ending="tome" direction="E" showArrow />
    </svg>
  );
}

/** 回答履歴の見本 */
function HistorySample() {
  const cells = ["木", "林", "", "", ""];
  return (
    <Group justify="space-between" wrap="nowrap" aria-hidden>
      <Group gap={6} wrap="nowrap">
        {cells.map((kanji, index) => (
          <div key={index} className={classes.cell}>
            {kanji}
            {kanji && <span className={classes.cross}>×</span>}
          </div>
        ))}
      </Group>
      <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
        残り 3 回
      </Text>
    </Group>
  );
}

interface Page {
  title: string;
  body: ReactNode;
}

const PAGES: readonly Page[] = [
  {
    title: "画面全体の見方",
    body: (
      <Stack gap="sm">
        <ScreenDiagram />
        <List type="ordered" size="sm" spacing={2}>
          <List.Item>
            情報バー: 答えの漢字の画数と難易度(エンドレスでは連続正解数も)
          </List.Item>
          <List.Item>
            正方形のエリア:
            ヒントの記号が表示されます。手書きのメモもここに書きます
          </List.Item>
          <List.Item>手書きツール: 「元に戻す」「全部消す」</List.Item>
          <List.Item>回答履歴: 回答した漢字と、残りの回数</List.Item>
          <List.Item>入力欄: 漢字を1文字入れて回答します</List.Item>
        </List>
      </Stack>
    ),
  },
  {
    title: "記号の意味",
    body: <SymbolGuide />,
  },
  {
    title: "手書きのメモ",
    body: (
      <Stack gap="sm">
        <MemoDiagram />
        <Text size="sm">
          正方形には、指やマウスで線を書けます。考えるためのメモなので、正解かどうかの判定には使いません。
        </Text>
        <Text size="sm">
          ヒントの記号はいつも手書きの線の上に表示されるので、書き込んでも隠れません。書いた線は「元に戻す」で1本ずつ、「全部消す」でまとめて消せます。
        </Text>
      </Stack>
    ),
  },
  {
    title: "回答の入力と誤答",
    body: (
      <Stack gap="sm">
        <HistorySample />
        <List size="sm" spacing={2}>
          <List.Item>入力欄に常用漢字を1文字入れて「回答」を押します</List.Item>
          <List.Item>
            1問につき{MAX_GUESSES}
            回まで回答できます。外れた漢字は、回答履歴に×付きで残ります
          </List.Item>
          <List.Item>
            常用漢字以外の文字や、もう回答した漢字は、回数に数えません
          </List.Item>
          <List.Item>
            正解するか{MAX_GUESSES}
            回とも外れると、正解の漢字と書き順が表示されます
          </List.Item>
        </List>
      </Stack>
    ),
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
          <Title order={3} size="h4" mb="sm">
            <span className={classes.pageNumber}>
              {page + 1}/{PAGES.length}
            </span>
            {current.title}
          </Title>
          {current.body}
        </div>
      </div>
      <Group justify="center" gap={8} role="group" aria-label="ページ">
        {PAGES.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={classes.dot}
            aria-current={index === page ? "step" : undefined}
            aria-label={`${index + 1}ページ目: ${item.title}`}
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

/** 遊び方の説明。4ページのカルーセル */
export function HowToModal({ opened, onClose }: HowToModal.Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="遊び方" centered>
      <HowToCarousel onClose={onClose} />
    </Modal>
  );
}
