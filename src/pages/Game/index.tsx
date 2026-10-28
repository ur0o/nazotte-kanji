import { Alert, Button, Center, Group, Loader } from "@mantine/core";
import { useMemo, useState } from "react";
import { useKanjiIndex, useKanjiStrokes } from "../../lib/data-queries.ts";
import type { KanjiEntry } from "../../lib/kanji-data.ts";
import type { Round } from "../../lib/game.ts";
import { AnswerForm } from "./AnswerForm.tsx";
import { Board } from "./Board.tsx";
import type { DrawingLine } from "./DrawingCanvas.tsx";
import { DrawingTools } from "./DrawingTools.tsx";
import { GameProvider, useGame, type GameMode } from "./GameContext.tsx";
import { GuessHistory } from "./GuessHistory.tsx";
import { InfoBar } from "./InfoBar.tsx";
import classes from "./Game.module.css";
import { ResultModal } from "./ResultModal.tsx";

export namespace GamePage {
  export interface Props {
    mode: GameMode;
  }
}

export function GamePage({ mode }: GamePage.Props) {
  const index = useKanjiIndex();

  if (index.isPending) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }
  if (index.isError) {
    return (
      <Alert color="red" title="問題を読み込めませんでした">
        <Button mt="sm" variant="default" onClick={() => index.refetch()}>
          再読み込み
        </Button>
      </Alert>
    );
  }
  return (
    <GameProvider mode={mode} kanjiList={index.data.list}>
      <GameScreen byKanji={index.data.byKanji} />
    </GameProvider>
  );
}

function GameScreen({ byKanji }: { byKanji: ReadonlyMap<string, KanjiEntry> }) {
  const { mode, round, status, nextRound } = useGame();
  const strokes = useKanjiStrokes(round.kanji);
  const jouyou = useMemo(() => new Set(byKanji.keys()), [byKanji]);
  // 手書きと結果モーダルを閉じた状態は、問題が変わったらリセットする
  const [drawing, setDrawing] = useState<{
    kanji: string;
    lines: DrawingLine[];
  }>({
    kanji: round.kanji,
    lines: [],
  });
  const [dismissedRound, setDismissedRound] = useState<Round | null>(null);
  const lines = drawing.kanji === round.kanji ? drawing.lines : [];
  const setLines = (next: DrawingLine[]) =>
    setDrawing({ kanji: round.kanji, lines: next });

  if (strokes.isError) {
    return (
      <Alert color="red" title="問題を読み込めませんでした">
        <Button mt="sm" variant="default" onClick={() => strokes.refetch()}>
          再読み込み
        </Button>
      </Alert>
    );
  }

  const finished = status !== "playing";
  return (
    <div className={classes.screen}>
      <InfoBar strokeCount={strokes.data?.strokes.length} />
      <Board
        strokes={strokes.data?.strokes}
        difficulty={round.difficulty}
        lines={lines}
        onLinesChange={setLines}
      />
      <DrawingTools lines={lines} onLinesChange={setLines} />
      <GuessHistory />
      {finished ? (
        <Group grow>
          <Button
            size="md"
            variant={
              mode.type === "endless" && status === "won" ? "default" : "filled"
            }
            onClick={() => setDismissedRound(null)}
          >
            結果を見る
          </Button>
          {mode.type === "endless" && status === "won" && (
            <Button size="md" onClick={nextRound}>
              次へ
            </Button>
          )}
        </Group>
      ) : (
        <AnswerForm key={round.kanji} jouyou={jouyou} />
      )}
      {strokes.data && (
        <ResultModal
          opened={finished && dismissedRound !== round}
          onClose={() => setDismissedRound(round)}
          strokes={strokes.data.strokes}
          entry={byKanji.get(round.kanji)}
        />
      )}
    </div>
  );
}
