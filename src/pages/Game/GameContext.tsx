import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dailyKanji, dailyNumber } from "../../lib/daily.ts";
import type { DailyDifficulty, Difficulty } from "../../lib/difficulty.ts";
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
  recordEndlessBest,
  saveDailyRound,
  updateSavedData,
} from "../../lib/storage.ts";

/** 鬼はエンドレスだけで選べる */
export type GameMode =
  | { type: "daily"; difficulty: DailyDifficulty }
  | { type: "endless"; difficulty: Difficulty };

interface GameContextValue {
  mode: GameMode;
  round: Round;
  status: GameStatus;
  /** エンドレスの連続正解数 */
  streak: number;
  /** エンドレスの、今回の挑戦を始める前の自己ベスト */
  previousBest: number;
  submitGuess: (guess: string) => void;
  /** 次の問題へ(エンドレスで正解したとき) */
  nextRound: () => void;
  /** 最初からやり直す(エンドレスで不正解になったとき) */
  restart: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame は GameProvider の中で使ってください");
  return value;
}

/** エンドレスの次の問題。最近出した漢字は避ける */
function newEndlessRound(
  difficulty: Difficulty,
  kanjiList: readonly string[],
): Round {
  const recent = new Set(loadSavedData().recent);
  const candidates = kanjiList.filter((kanji) => !recent.has(kanji));
  const kanji = pickRandom(
    candidates.length > 0 ? candidates : kanjiList,
    Math.random,
  );
  return { kanji, difficulty, guesses: [] };
}

/** 今日の1文字。挑戦の途中や結果が保存されていればそれを使う */
function dailyRound(
  number: number,
  difficulty: DailyDifficulty,
  kanjiList: readonly string[],
): Round {
  const kanji = dailyKanji(number, difficulty, kanjiList);
  const saved = loadSavedData().daily[difficulty][String(number)];
  if (saved && saved.kanji === kanji) return saved;
  return { kanji, difficulty, guesses: [] };
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
  const { type, difficulty } = mode;
  const [number] = useState(() =>
    type === "daily" ? dailyNumber(new Date()) : undefined,
  );
  const dailyDifficulty = mode.type === "daily" ? mode.difficulty : undefined;
  const [round, setRound] = useState<Round>(() =>
    number !== undefined && dailyDifficulty !== undefined
      ? dailyRound(number, dailyDifficulty, kanjiList)
      : newEndlessRound(difficulty, kanjiList),
  );
  const [streak, setStreak] = useState(0);
  const [previousBest, setPreviousBest] = useState(
    () => loadSavedData().endlessBest[difficulty],
  );

  // エンドレスで出した漢字を、しばらく出題しないよう記録する
  useEffect(() => {
    if (number === undefined)
      updateSavedData((data) => addRecent(data, round.kanji));
  }, [number, round.kanji]);

  const submitGuess = useCallback(
    (guess: string) => {
      const next = addGuess(round, guess);
      if (next === round) return;
      setRound(next);
      if (number !== undefined && dailyDifficulty !== undefined) {
        updateSavedData((data) =>
          saveDailyRound(data, number, dailyDifficulty, next),
        );
      } else if (roundStatus(next) === "won") {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        updateSavedData((data) =>
          recordEndlessBest(data, difficulty, nextStreak),
        );
      }
    },
    [round, number, dailyDifficulty, streak, difficulty],
  );

  const nextRound = useCallback(() => {
    if (type !== "endless") return;
    setRound(newEndlessRound(difficulty, kanjiList));
  }, [type, difficulty, kanjiList]);

  const restart = useCallback(() => {
    if (type !== "endless") return;
    setPreviousBest(loadSavedData().endlessBest[difficulty]);
    setStreak(0);
    setRound(newEndlessRound(difficulty, kanjiList));
  }, [type, difficulty, kanjiList]);

  const value = useMemo(
    (): GameContextValue => ({
      mode,
      round,
      status: roundStatus(round),
      streak,
      previousBest,
      submitGuess,
      nextRound,
      restart,
    }),
    [mode, round, streak, previousBest, submitGuess, nextRound, restart],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
