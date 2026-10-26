import { Group, Text } from "@mantine/core";
import { MAX_GUESSES } from "../../lib/answer.ts";
import { useGame } from "./GameContext.tsx";
import classes from "./GuessHistory.module.css";

/** 回答した漢字を5つのマスに並べる */
export function GuessHistory() {
  const { round } = useGame();
  const remaining = MAX_GUESSES - round.guesses.length;

  return (
    <Group justify="space-between" wrap="nowrap" mb="xs">
      <Group gap={6} wrap="nowrap" role="list" aria-label="回答履歴">
        {Array.from({ length: MAX_GUESSES }, (_, index) => {
          const guess = round.guesses[index];
          const correct = guess === round.kanji;
          return (
            <div
              key={index}
              role="listitem"
              className={classes.cell}
              data-state={
                guess === undefined ? "empty" : correct ? "correct" : "wrong"
              }
              aria-label={
                guess === undefined
                  ? "未回答"
                  : `${guess}(${correct ? "正解" : "不正解"})`
              }
            >
              {guess}
              {guess !== undefined && !correct && (
                <span className={classes.mark} aria-hidden>
                  ×
                </span>
              )}
            </div>
          );
        })}
      </Group>
      <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
        残り {remaining} 回
      </Text>
    </Group>
  );
}
