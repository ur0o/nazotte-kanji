import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dailyNumber, dailyPuzzle } from "../../lib/daily.ts";
import { DIFFICULTIES, type Difficulty } from "../../lib/difficulty.ts";
import {
  addGuess,
  roundStatus,
  type GameStatus,
  type Round,
} from "../../lib/game.ts";
import { pickRandom } from "../../lib/random.ts";
import {
  addRecent,
  loadSavedData,
  recordBest,
  updateSavedData,
} from "../../lib/storage.ts";

export type GameMode =
  | { type: "daily" }
  | { type: "endless" }
  | { type: "level"; difficulty: Difficulty };

export const MODE_LABELS: Readonly<Record<GameMode["type"], string>> = {
  daily: "今日の1字",
  endless: "エンドレス",
  level: "難易度選択",
};

interface GameContextValue {
  mode: GameMode;
  round: Round;
  status: GameStatus;
  /** 今日の1字の問題番号 */
  dailyNumber: number | undefined;
  /** エンドレス・難易度選択の連続正解数 */
  streak: number;
  /** エンドレス・難易度選択の、今回の挑戦を始める前の自己ベスト */
  previousBest: number;
  submitGuess: (guess: string) => void;
  /** 次の問題へ(エンドレス・難易度選択で正解したとき) */
  nextRound: () => void;
  /** 最初からやり直す(エンドレス・難易度選択で不正解になったとき) */
  restart: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame は GameProvider の中で使ってください");
  return value;
}

function bestOf(mode: GameMode): number {
  const data = loadSavedData();
  if (mode.type === "endless") return data.endlessBest;
  if (mode.type === "level") return data.levelBest[mode.difficulty];
  return 0;
}

/** エンドレス・難易度選択の次の問題。最近出した漢字は避ける */
function newRandomRound(mode: GameMode, kanjiList: readonly string[]): Round {
  const recent = new Set(loadSavedData().recent);
  const candidates = kanjiList.filter((kanji) => !recent.has(kanji));
  const kanji = pickRandom(
    candidates.length > 0 ? candidates : kanjiList,
    Math.random,
  );
  const difficulty =
    mode.type === "level"
      ? mode.difficulty
      : pickRandom(DIFFICULTIES, Math.random);
  return { kanji, difficulty, guesses: [] };
}

/** 今日の1字。挑戦の途中や結果が保存されていればそれを使う */
function dailyRound(number: number, kanjiList: readonly string[]): Round {
  const puzzle = dailyPuzzle(number, kanjiList);
  const saved = loadSavedData().daily[String(number)];
  if (saved && saved.kanji === puzzle.kanji) return saved;
  return { kanji: puzzle.kanji, difficulty: puzzle.difficulty, guesses: [] };
}

export namespace GameProvider {
  export interface Props {
    mode: GameMode;
    kanjiList: readonly string[];
    children: ReactNode;
  }
}

export function GameProvider({
  mode,
  kanjiList,
  children,
}: GameProvider.Props) {
  const [number] = useState(() =>
    mode.type === "daily" ? dailyNumber(new Date()) : undefined,
  );
  const [round, setRound] = useState<Round>(() =>
    number !== undefined
      ? dailyRound(number, kanjiList)
      : newRandomRound(mode, kanjiList),
  );
  const [streak, setStreak] = useState(0);
  const [previousBest, setPreviousBest] = useState(() => bestOf(mode));

  // エンドレス・難易度選択で出した漢字を、しばらく出題しないよう記録する
  useEffect(() => {
    if (number === undefined)
      updateSavedData((data) => addRecent(data, round.kanji));
  }, [number, round.kanji]);

  const submitGuess = useCallback(
    (guess: string) => {
      const next = addGuess(round, guess);
      if (next === round) return;
      setRound(next);
      const status = roundStatus(next);
      if (number !== undefined) {
        updateSavedData((data) => ({
          ...data,
          daily: { ...data.daily, [String(number)]: next },
        }));
      } else if (status === "won") {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        updateSavedData((data) =>
          recordBest(
            data,
            mode.type === "level" ? mode.difficulty : null,
            nextStreak,
          ),
        );
      }
    },
    [round, number, streak, mode],
  );

  const nextRound = useCallback(() => {
    if (mode.type === "daily") return;
    setRound(newRandomRound(mode, kanjiList));
  }, [mode, kanjiList]);

  const restart = useCallback(() => {
    if (mode.type === "daily") return;
    setPreviousBest(bestOf(mode));
    setStreak(0);
    setRound(newRandomRound(mode, kanjiList));
  }, [mode, kanjiList]);

  const value = useMemo(
    (): GameContextValue => ({
      mode,
      round,
      status: roundStatus(round),
      dailyNumber: number,
      streak,
      previousBest,
      submitGuess,
      nextRound,
      restart,
    }),
    [
      mode,
      round,
      number,
      streak,
      previousBest,
      submitGuess,
      nextRound,
      restart,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
