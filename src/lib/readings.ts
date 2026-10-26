/**
 * KANJIDIC2 の訓読みを表示用にする。
 * 送り仮名の区切り "." を括弧にする(例: "あ.がる" → "あ(がる)")。
 * 接頭語・接尾語を表す "-" はそのまま残す。
 */
export function formatKunReading(reading: string): string {
  const [stem, okurigana] = reading.split(".");
  if (okurigana === undefined) return reading;
  const suffix = okurigana.endsWith("-") ? "-" : "";
  return `${stem}(${okurigana.replace(/-$/, "")})${suffix}`;
}

/** 重複を除いて表示用に並べる */
export function formatReadings(readings: readonly string[]): string {
  return [...new Set(readings)].join("・");
}

/**
 * 結果に表示する訓読み。接頭語・接尾語としての読み("-" 付き)は、
 * それ以外の読みがあるときは省く(例: 児 の "-こ" "-っこ")。
 */
export function displayKunReadings(readings: readonly string[]): string[] {
  const plain = readings.filter((reading) => !reading.includes("-"));
  return (plain.length > 0 ? plain : readings).map(formatKunReading);
}
