import path from "node:path";

export const CACHE_DIR = path.resolve(import.meta.dirname, "../.cache/sources");

export interface Source {
  name: string;
  repository: string;
  /** 再現性のため、取得するコミットを固定する */
  commit: string;
  dir: string;
}

/** 書き順と各画の線(CC BY-SA 3.0) */
export const KANJIVG: Source = {
  name: "KanjiVG",
  repository: "https://github.com/KanjiVG/kanjivg.git",
  commit: "70a0b7ae0c18ceb5cb358274b029cce0234a43bc",
  dir: path.join(CACHE_DIR, "kanjivg"),
};

/**
 * KANJIDIC2(CC BY-SA 4.0)を JSON に変換したデータ。
 * 常用漢字の一覧と読みに使う。
 */
export const KANJI_DATA: Source = {
  name: "kanji-data",
  repository: "https://github.com/davidluzgouveia/kanji-data.git",
  commit: "00fd7079c3890f430759536f91aa5e854ec0ca4f",
  dir: path.join(CACHE_DIR, "kanji-data"),
};

export const SOURCES: readonly Source[] = [KANJIVG, KANJI_DATA];
