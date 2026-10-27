import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { HintMarker } from "../../components/HintMarker.tsx";
import { dailyNumber } from "../../lib/daily.ts";
import {
  DAILY_DIFFICULTIES,
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  type DailyDifficulty,
  type Difficulty,
} from "../../lib/difficulty.ts";
import { roundStatus, scoreLabel } from "../../lib/game.ts";
import { loadSavedData } from "../../lib/storage.ts";
import { MODE_LABELS } from "../../lib/modes.ts";
import { Credits } from "./Credits.tsx";
import classes from "./Top.module.css";

/** 難易度ごとの、今日の1文字の結果(例: 3/5)。未挑戦や回答中は含めない */
function todayResults(
  number: number,
): Partial<Record<DailyDifficulty, string>> {
  const { daily } = loadSavedData();
  const results: Partial<Record<DailyDifficulty, string>> = {};
  for (const difficulty of DAILY_DIFFICULTIES) {
    const round = daily[difficulty][String(number)];
    if (round && roundStatus(round) !== "playing") {
      results[difficulty] = scoreLabel(round);
    }
  }
  return results;
}

function ButtonLabel({
  difficulty,
  result,
}: {
  difficulty: Difficulty;
  result?: string;
}) {
  return (
    <span className={classes.difficulty}>
      {DIFFICULTY_LABELS[difficulty]}
      {result && <span className={classes.result}>{result}</span>}
    </span>
  );
}

function DailyButtons({
  results,
}: {
  results: Partial<Record<DailyDifficulty, string>>;
}) {
  return (
    <div className={classes.buttons}>
      {DAILY_DIFFICULTIES.map((difficulty) => (
        <Button
          key={difficulty}
          size="lg"
          aria-label={`${MODE_LABELS.daily} ${DIFFICULTY_LABELS[difficulty]}`}
          renderRoot={(props) => (
            <Link to="/daily/$difficulty" params={{ difficulty }} {...props} />
          )}
        >
          <ButtonLabel difficulty={difficulty} result={results[difficulty]} />
        </Button>
      ))}
    </div>
  );
}

function EndlessButtons() {
  return (
    <div className={classes.buttons}>
      {DIFFICULTIES.map((difficulty) => (
        <Button
          key={difficulty}
          size="lg"
          variant="default"
          aria-label={`${MODE_LABELS.endless} ${DIFFICULTY_LABELS[difficulty]}`}
          renderRoot={(props) => (
            <Link
              to="/endless/$difficulty"
              params={{ difficulty }}
              {...props}
            />
          )}
        >
          <ButtonLabel difficulty={difficulty} />
        </Button>
      ))}
    </div>
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
        <Title order={2} size="h4">
          {MODE_LABELS.daily}
        </Title>
        <DailyButtons results={results} />
      </Stack>
      <Stack gap="xs">
        <Title order={2} size="h4">
          {MODE_LABELS.endless}
        </Title>
        <EndlessButtons />
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
              <Text fw={700} w={56} ta="center" style={{ flex: "none" }}>
                {DIFFICULTY_LABELS[difficulty]}
              </Text>
              <DifficultySample difficulty={difficulty} />
              <Text size="sm">{DIFFICULTY_DESCRIPTIONS[difficulty]}</Text>
            </Group>
          ))}
        </Stack>
      </Modal>
      <Credits />
    </Stack>
  );
}
