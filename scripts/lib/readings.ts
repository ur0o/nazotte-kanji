const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KATAKANA_OFFSET = 0x60;

export function hiraganaToKatakana(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code >= HIRAGANA_START && code <= HIRAGANA_END
        ? String.fromCodePoint(code + KATAKANA_OFFSET)
        : char;
    })
    .join("");
}
