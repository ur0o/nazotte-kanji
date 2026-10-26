import {
  Badge,
  Button,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { StrokeAnimation } from "../../components/StrokeAnimation.tsx";
import type { KanjiEntry, Stroke } from "../../lib/kanji-data.ts";
import { displayKunReadings, formatReadings } from "../../lib/readings.ts";
import { scoreLabel } from "../../lib/game.ts";
import { dailyShareText, xShareUrl } from "../../lib/share.ts";
import { Countdown } from "./Countdown.tsx";
import { useGame } from "./GameContext.tsx";
import classes from "./ResultModal.module.css";

export namespace ResultModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
    strokes: readonly Stroke[];
    entry: KanjiEntry | undefined;
  }
}

function shareUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function DailyActions() {
  const { round, dailyNumber } = useGame();
  if (dailyNumber === undefined) return null;
  const text = dailyShareText(dailyNumber, round, shareUrl());
  return (
    <Stack gap="xs">
      <Group grow>
        <CopyButton value={text}>
          {({ copied, copy }) => (
            <Button variant="default" onClick={copy}>
              {copied ? "コピーしました" : "結果をコピー"}
            </Button>
          )}
        </CopyButton>
        <Button
          component="a"
          href={xShareUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
        >
          X に投稿
        </Button>
      </Group>
      <Text size="sm" c="dimmed" ta="center">
        次の問題まで <Countdown />
      </Text>
      <Button
        variant="subtle"
        renderRoot={(props) => <Link to="/" {...props} />}
      >
        トップへ
      </Button>
    </Stack>
  );
}

function ContinuousActions({ onClose }: { onClose: () => void }) {
  const { status, streak, previousBest, nextRound, restart } = useGame();
  if (status === "won") {
    return (
      <Button
        onClick={() => {
          onClose();
          nextRound();
        }}
      >
        次へ
      </Button>
    );
  }
  const isNewBest = streak > previousBest;
  return (
    <Stack gap="xs">
      <Group justify="center" gap="lg">
        <Text>
          連続正解 <strong>{streak}</strong>
        </Text>
        <Text>
          自己ベスト <strong>{Math.max(streak, previousBest)}</strong>
        </Text>
        {isNewBest && <Badge color="yellow">新記録</Badge>}
      </Group>
      <Group grow>
        <Button
          variant="default"
          renderRoot={(props) => <Link to="/" {...props} />}
        >
          トップへ
        </Button>
        <Button
          onClick={() => {
            onClose();
            restart();
          }}
        >
          もう一度
        </Button>
      </Group>
    </Stack>
  );
}

export function ResultModal({
  opened,
  onClose,
  strokes,
  entry,
}: ResultModal.Props) {
  const { mode, round, status } = useGame();
  const [playKey, setPlayKey] = useState(0);
  const won = status === "won";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={
        <Group gap="sm">
          <Title order={2} size="h3">
            {won ? "正解！" : "不正解"}
          </Title>
          <Text c="dimmed">{scoreLabel(round)}</Text>
        </Group>
      }
    >
      <Stack gap="md">
        <Group align="center" gap="md" wrap="nowrap">
          <div className={classes.animation}>
            <StrokeAnimation strokes={strokes} playKey={playKey} />
          </div>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text className={classes.kanji} aria-label="正解の漢字">
              {round.kanji}
            </Text>
            {entry && entry.on.length > 0 && (
              <Text size="sm">
                <Text span c="dimmed" size="sm">
                  音{" "}
                </Text>
                {formatReadings(entry.on)}
              </Text>
            )}
            {entry && entry.kun.length > 0 && (
              <Text size="sm">
                <Text span c="dimmed" size="sm">
                  訓{" "}
                </Text>
                {formatReadings(displayKunReadings(entry.kun))}
              </Text>
            )}
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => setPlayKey((key) => key + 1)}
              style={{ alignSelf: "flex-start" }}
            >
              書き順を再生
            </Button>
          </Stack>
        </Group>
        {mode.type === "daily" ? (
          <DailyActions />
        ) : (
          <ContinuousActions onClose={onClose} />
        )}
      </Stack>
    </Modal>
  );
}
