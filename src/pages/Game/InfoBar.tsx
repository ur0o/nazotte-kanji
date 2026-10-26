import { Badge, Group, Text } from "@mantine/core";
import { DIFFICULTY_LABELS } from "../../lib/difficulty.ts";
import { MODE_LABELS, useGame } from "./GameContext.tsx";

export function InfoBar() {
  const { mode, round, dailyNumber, streak } = useGame();
  return (
    <Group justify="space-between" mb="xs">
      <Group gap="xs">
        <Text fw={700}>{MODE_LABELS[mode.type]}</Text>
        {dailyNumber !== undefined && <Text c="dimmed">#{dailyNumber}</Text>}
      </Group>
      <Group gap="xs">
        {mode.type !== "daily" && (
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
