import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { dailyNumber } from "../../lib/daily.ts";
import {
  DAILY_DIFFICULTIES,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type DailyDifficulty,
  type Difficulty,
} from "../../lib/difficulty.ts";
import { roundStatus, scoreLabel } from "../../lib/game.ts";
import { loadSavedData } from "../../lib/storage.ts";
import { MODE_LABELS } from "../../lib/modes.ts";
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
      {result && (
        <>
          <span className={classes.result}>{result}</span>
          {/* 横幅が狭いときは結果の代わりに印だけを付ける */}
          <span className={classes.resultMark} aria-hidden>
            *
          </span>
        </>
      )}
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
          px="xs"
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
          px="xs"
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

export function TopPage() {
  const [number] = useState(() => dailyNumber(new Date()));
  const [results] = useState(() => todayResults(number));

  return (
    <Stack gap="xl" py="lg">
      <Text ta="center" c="dimmed">
        各画の終わる位置と、終わり方（とめ・はね・はらい）を手がかりに漢字を当てよう
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
    </Stack>
  );
}
