import { HintMarker } from "../../components/HintMarker.tsx";
import type { Ending } from "../../lib/kanji-data.ts";
import classes from "./SymbolLegend.module.css";

const LEGEND: readonly { ending: Ending; label: string }[] = [
  { ending: "tome", label: "とめ" },
  { ending: "hane", label: "はね" },
  { ending: "harai", label: "はらい" },
];

/** 記号と終わり方の対応(とめ・はね・はらい) */
export function SymbolLegend() {
  return (
    <ul className={classes.root} aria-label="記号の意味">
      {LEGEND.map(({ ending, label }) => (
        <li key={ending} className={classes.item}>
          <svg viewBox="-4 -4 8 8" className={classes.symbol} aria-hidden>
            <HintMarker
              x={0}
              y={0}
              ending={ending}
              direction="E"
              showArrow={false}
            />
          </svg>
          {label}
        </li>
      ))}
    </ul>
  );
}
