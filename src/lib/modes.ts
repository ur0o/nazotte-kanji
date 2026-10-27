export type ModeType = "daily" | "endless";

export const MODE_LABELS: Readonly<Record<ModeType, string>> = {
  daily: "今日の1文字",
  endless: "エンドレス",
};

/** URL のパスから、ゲーム画面のモードを返す。ゲーム画面でなければ undefined */
export function modeOfPath(pathname: string): ModeType | undefined {
  if (pathname.startsWith("/daily/")) return "daily";
  if (pathname.startsWith("/endless/")) return "endless";
  return undefined;
}
