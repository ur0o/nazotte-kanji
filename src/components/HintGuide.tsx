import { Badge, Group, Stack, Text } from "@mantine/core";
import {
  DIFFICULTIES,
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  type DifficultyHints,
} from "../lib/difficulty.ts";
import { HintMarker } from "./HintMarker.tsx";
import classes from "./HintGuide.module.css";

/** 見本の画(44×44 の座標系)。「手」の最後の画のような、下に引いて左上にはねる画 */
const SAMPLE_STROKE = "M26,4 V32 L20,26";
const SAMPLE_END: [number, number] = [20, 26];

/** 見本は問題の正方形(109×109)より狭い座標系なので、記号を拡大して同じ見た目にそろえる */
const MARKER_SCALE = 1.7;

interface HintGuideItem {
  key: keyof DifficultyHints;
  name: string;
  description: string;
}

const HINT_GUIDES: readonly HintGuideItem[] = [
  {
    key: "strokeNumbers",
    name: "書き順の番号",
    description: "その画が何画目かを、記号の近くに数字で表示します",
  },
  {
    key: "arrows",
    name: "画の終わりの向き",
    description: "画が終わるときに進んでいた向きを、矢印で表示します",
  },
];

function HintSample({ hint }: { hint: keyof DifficultyHints }) {
  const [x, y] = SAMPLE_END;
  return (
    <svg viewBox="0 0 44 44" className={classes.sample} aria-hidden>
      <path d={SAMPLE_STROKE} className={classes.sampleStroke} />
      <g transform={`translate(${x} ${y}) scale(${MARKER_SCALE})`}>
        <HintMarker
          x={0}
          y={0}
          ending="hane"
          direction="NW"
          showArrow={hint === "arrows"}
        />
        {hint === "strokeNumbers" && (
          <text x={-5.5} y={-4} className={classes.number}>
            4
          </text>
        )}
      </g>
    </svg>
  );
}

/** 難易度によって増えるヒント(書き順の番号と、画の終わりの向き)の説明 */
export function HintGuide() {
  return (
    <Stack gap="md">
      <Text size="sm">
        画が終わる位置と終わり方は、すべての難易度で表示されます。難易度によって、次のヒントが加わります。
      </Text>
      <Stack gap="sm">
        {HINT_GUIDES.map((guide) => (
          <Group key={guide.key} gap="md" wrap="nowrap" align="center">
            <HintSample hint={guide.key} />
            <Stack gap={4} className={classes.text}>
              <Text fw={700}>{guide.name}</Text>
              <Group gap={4}>
                {DIFFICULTIES.filter(
                  (difficulty) => DIFFICULTY_HINTS[difficulty][guide.key],
                ).map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant="outline"
                    color="gray"
                    size="sm"
                  >
                    {DIFFICULTY_LABELS[difficulty]}
                  </Badge>
                ))}
              </Group>
              <Text size="sm">{guide.description}</Text>
            </Stack>
          </Group>
        ))}
      </Stack>
      <Text size="xs" c="dimmed" className={classes.notes}>
        鬼(エンドレスだけで選べます)では、どちらも表示されません。
      </Text>
    </Stack>
  );
}
