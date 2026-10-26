import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
  kanjiFileName,
  kanjiIndexSchema,
  kanjiStrokesSchema,
} from "./kanji-data.ts";

async function fetchJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!response.ok)
    throw new Error(`${path} を読み込めませんでした (${response.status})`);
  return schema.parse(await response.json());
}

/** 常用漢字の一覧と読み */
export function useKanjiIndex() {
  return useQuery({
    queryKey: ["data", "index.json"],
    queryFn: async () => {
      const index = await fetchJson("data/index.json", kanjiIndexSchema);
      return {
        entries: index.kanji,
        list: index.kanji.map((entry) => entry.kanji),
        byKanji: new Map(index.kanji.map((entry) => [entry.kanji, entry])),
      };
    },
  });
}

/** 1字分の各画のデータ */
export function useKanjiStrokes(kanji: string | undefined) {
  const fileName = kanji ? `${kanjiFileName(kanji)}.json` : "";
  return useQuery({
    queryKey: ["data", "kanji", fileName],
    queryFn: () => fetchJson(`data/kanji/${fileName}`, kanjiStrokesSchema),
    enabled: kanji !== undefined,
  });
}
