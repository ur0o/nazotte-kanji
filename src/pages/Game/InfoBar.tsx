import { Badge, Group, Text } from "@mantine/core";
import { DIFFICULTY_LABELS } from "../../lib/difficulty.ts";
import { useGame } from "./GameContext.tsx";

export namespace InfoBar {
  export interface Props {
    /** 答えの漢字の画数。読み込み中は undefined */
    strokeCount: number | undefined;
  }
}

export function InfoBar({ strokeCount }: InfoBar.Props) {
  const { mode, round, streak } = useGame();
  return (
    <Group justify="space-between" mb="xs">
      <Text fw={700} aria-label="答えの漢字の画数">
        {strokeCount === undefined ? "\u00a0" : `${strokeCount}画`}
      </Text>
      <Group gap="xs">
        {mode.type === "endless" && (
          <Text size="sm" c="dimmed">
            連続正解 <strong>{streak}</strong>
          </Text>
        )}
        <Badge variant="light" size="lg" aria-label="難易度">
          {DIFFICULTY_LABELS[round.difficulty]}
        </Badge>
      </Group>
    </Group>
  );
}
