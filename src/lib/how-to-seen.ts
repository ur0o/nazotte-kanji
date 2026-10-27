const STORAGE_KEY = "kanji-kaki-quiz:how-to-seen";

/** 遊び方を表示したことがあるか。記録を読めない環境では未表示として扱う */
export function hasSeenHowTo(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHowToSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 記録できない環境では、次に開いたときもう一度表示する
  }
}
