import { useEffect, useState } from "react";
import { msUntilNextDaily } from "../../lib/daily.ts";

function format(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

/** 次の今日の1字までの残り時間 */
export function Countdown() {
  const [remaining, setRemaining] = useState(() =>
    msUntilNextDaily(new Date()),
  );
  useEffect(() => {
    const timer = setInterval(
      () => setRemaining(msUntilNextDaily(new Date())),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  return <span>{format(remaining)}</span>;
}
