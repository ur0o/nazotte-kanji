import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { HintMarker } from "../../components/HintMarker.tsx";
import { dailyNumber } from "../../lib/daily.ts";
import {
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  type Difficulty,
} from "../../lib/difficulty.ts";
import { roundStatus, scoreLabel } from "../../lib/game.ts";
import { loadSavedData } from "../../lib/storage.ts";
import { MODE_LABELS, type ModeType } from "../Game/GameContext.tsx";
import classes from "./Top.module.css";

/** 難易度ごとの、今日の1字の結果(例: 3/5)。未挑戦や回答中は undefined */
function todayResults(number: number): Partial<Record<Difficulty, string>> {
  const { daily } = loadSavedData();
  const results: Partial<Record<Difficulty, string>> = {};
  for (const difficulty of DIFFICULTIES) {
    const round = daily[difficulty][String(number)];
    if (round && roundStatus(round) !== "playing") {
      results[difficulty] = scoreLabel(round);
    }
  }
  return results;
}

function DifficultyButtons({
  mode,
  results = {},
}: {
  mode: ModeType;
  results?: Partial<Record<Difficulty, string>>;
}) {
  return (
    <Group grow gap="xs">
      {DIFFICULTIES.map((difficulty) => (
        <Button
          key={difficulty}
          size="lg"
          variant={mode === "daily" ? "filled" : "default"}
          aria-label={`${MODE_LABELS[mode]} ${DIFFICULTY_LABELS[difficulty]}`}
          renderRoot={(props) =>
            mode === "daily" ? (
              <Link
                to="/daily/$difficulty"
                params={{ difficulty }}
                {...props}
              />
            ) : (
              <Link
                to="/endless/$difficulty"
                params={{ difficulty }}
                {...props}
              />
            )
          }
        >
          <span className={classes.difficulty}>
            {DIFFICULTY_LABELS[difficulty]}
            {results[difficulty] && (
              <span className={classes.result}>{results[difficulty]}</span>
            )}
          </span>
        </Button>
      ))}
    </Group>
  );
}

/** 難易度ごとのヒントの見本(はねの記号1つ) */
function DifficultySample({ difficulty }: { difficulty: Difficulty }) {
  const hints = DIFFICULTY_HINTS[difficulty];
  return (
    <svg viewBox="0 0 24 24" className={classes.sample} aria-hidden>
      <HintMarker
        x={10}
        y={14}
        ending="hane"
        direction="NE"
        showArrow={hints.arrows}
      />
      {hints.strokeNumbers && (
        <text x={4} y={9} className={classes.sampleNumber}>
          3
        </text>
      )}
    </svg>
  );
}

export function TopPage() {
  const [number] = useState(() => dailyNumber(new Date()));
  const [results] = useState(() => todayResults(number));
  const [helpOpened, setHelpOpened] = useState(false);

  return (
    <Stack gap="xl" py="lg">
      <Text ta="center" c="dimmed">
        各画の終わる位置と、とめ・はね・はらいだけを手がかりに漢字を当てよう
      </Text>
      <Stack gap="xs">
        <Group justify="space-between" align="baseline">
          <Title order={2} size="h4">
            {MODE_LABELS.daily}
          </Title>
          <Text c="dimmed" size="sm">
            #{number}
          </Text>
        </Group>
        <DifficultyButtons mode="daily" results={results} />
      </Stack>
      <Stack gap="xs">
        <Title order={2} size="h4">
          {MODE_LABELS.endless}
        </Title>
        <DifficultyButtons mode="endless" />
      </Stack>
      <Button
        variant="subtle"
        onClick={() => setHelpOpened(true)}
        style={{ alignSelf: "center" }}
      >
        難易度について
      </Button>
      <Modal
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
        title="難易度について"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            どの難易度でも、各画の終わる位置と、とめ・はね・はらいは表示されます。出題される漢字の範囲(常用漢字)も同じです。
          </Text>
          {DIFFICULTIES.map((difficulty) => (
            <Group key={difficulty} gap="sm" wrap="nowrap">
              <Text fw={700} w={24} ta="center" style={{ flex: "none" }}>
                {DIFFICULTY_LABELS[difficulty]}
              </Text>
              <DifficultySample difficulty={difficulty} />
              <Text size="sm">{DIFFICULTY_DESCRIPTIONS[difficulty]}</Text>
            </Group>
          ))}
        </Stack>
      </Modal>
    </Stack>
  );
}
