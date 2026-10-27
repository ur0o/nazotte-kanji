import { Group, Modal, Stack, Text } from "@mantine/core";
import type { Direction, Ending } from "../lib/kanji-data.ts";
import { HintMarker } from "./HintMarker.tsx";
import classes from "./SymbolGuideModal.module.css";

export namespace SymbolGuideModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
  }
}

interface EndingGuide {
  ending: Ending;
  name: string;
  description: string;
  examples: string;
  /** 見本の画(44×44 の座標系)と、その終点・終わるときの向き */
  stroke: { path: string; end: [number, number]; direction: Direction };
}

const ENDING_GUIDES: readonly EndingGuide[] = [
  {
    ending: "tome",
    name: "とめ",
    description: "画の終わりで筆を止める",
    examples: "「二」の横画、「木」の縦画",
    stroke: { path: "M5,22 H25", end: [25, 22], direction: "E" },
  },
  {
    ending: "hane",
    name: "はね",
    description: "画の終わりで筆を跳ね上げる",
    examples: "「小」の1画目、「手」の最後の画",
    stroke: { path: "M26,4 V32 L20,26", end: [20, 26], direction: "NW" },
  },
  {
    ending: "harai",
    name: "はらい",
    description: "画の終わりで筆を払うように抜く",
    examples: "「人」の2つの画、「大」の2画目と3画目",
    stroke: { path: "M36,4 Q31,24 14,31", end: [14, 31], direction: "SW" },
  },
];

/** 見本は問題の正方形(109×109)より狭い座標系なので、記号を拡大して同じ見た目にそろえる */
const MARKER_SCALE = 1.7;

function StrokeSample({ guide }: { guide: EndingGuide }) {
  const { path, end, direction } = guide.stroke;
  return (
    <svg viewBox="0 0 44 44" className={classes.sample} aria-hidden>
      <path d={path} className={classes.sampleStroke} />
      <g transform={`translate(${end[0]} ${end[1]}) scale(${MARKER_SCALE})`}>
        <HintMarker
          x={0}
          y={0}
          ending={guide.ending}
          direction={direction}
          showArrow
        />
      </g>
    </svg>
  );
}

/** とめ・はね・はらいの記号と、矢印・番号の見方 */
export function SymbolGuideModal({ opened, onClose }: SymbolGuideModal.Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="記号の見方" centered>
      <Stack gap="md">
        <Text size="sm">
          正方形の中の記号は、それぞれの画が終わる位置と、どのように終わるかを表します。
        </Text>
        <Stack gap="sm">
          {ENDING_GUIDES.map((guide) => (
            <Group key={guide.ending} gap="md" wrap="nowrap" align="center">
              <StrokeSample guide={guide} />
              <Stack gap={2} className={classes.text}>
                <Text fw={700}>{guide.name}</Text>
                <Text size="sm">{guide.description}</Text>
                <Text size="xs" c="dimmed">
                  例: {guide.examples}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
        <Stack gap={4} className={classes.notes}>
          <Text size="sm">
            <strong>矢印</strong>:
            画が終わるときに進んでいた向きを表します(易で表示)。上の見本では、灰色の線が画で、記号の位置で終わっています。実際の問題では画の線は表示されません。
          </Text>
          <Text size="sm">
            <strong>数字</strong>: その画が何画目かを表します(易・普で表示)。
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
}
