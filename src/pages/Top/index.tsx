import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { dailyNumber } from "../../lib/daily.ts";
import {
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
} from "../../lib/difficulty.ts";
import { roundStatus, scoreLabel } from "../../lib/game.ts";
import { loadSavedData } from "../../lib/storage.ts";
import classes from "./Top.module.css";

/** 今日の1字に挑戦済みなら、その結果(例: 3/5) */
function todayResult(): string | undefined {
  const round = loadSavedData().daily[String(dailyNumber(new Date()))];
  if (!round || roundStatus(round) === "playing") return undefined;
  return scoreLabel(round);
}

export function TopPage() {
  const [result] = useState(todayResult);
  const [helpOpened, setHelpOpened] = useState(false);

  return (
    <Stack gap="lg" py="lg">
      <Text ta="center" c="dimmed">
        各画の終わる位置と、とめ・はね・はらいだけを手がかりに漢字を当てよう
      </Text>
      <Button
        size="xl"
        renderRoot={(props) => <Link to="/daily" {...props} />}
        rightSection={
          result && <span className={classes.result}>{result}</span>
        }
      >
        今日の1字
      </Button>
      <Button
        size="xl"
        variant="default"
        renderRoot={(props) => <Link to="/endless" {...props} />}
      >
        エンドレス
      </Button>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={700}>難易度を選ぶ</Text>
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => setHelpOpened(true)}
          >
            難易度について
          </Button>
        </Group>
        <Group grow>
          {DIFFICULTIES.map((difficulty) => (
            <Button
              key={difficulty}
              size="lg"
              variant="default"
              renderRoot={(props) => (
                <Link
                  to="/level/$difficulty"
                  params={{ difficulty }}
                  {...props}
                />
              )}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </Button>
          ))}
        </Group>
      </Stack>
      <Modal
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
        title="難易度について"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            出題される漢字の範囲はどの難易度も同じ(常用漢字)です。
          </Text>
          {DIFFICULTIES.map((difficulty) => (
            <Group key={difficulty} gap="sm" wrap="nowrap">
              <Text fw={700} w={24} ta="center">
                {DIFFICULTY_LABELS[difficulty]}
              </Text>
              <Text size="sm">{DIFFICULTY_DESCRIPTIONS[difficulty]}</Text>
            </Group>
          ))}
        </Stack>
      </Modal>
    </Stack>
  );
}
