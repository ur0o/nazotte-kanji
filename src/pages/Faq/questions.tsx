import type { ReactNode } from "react";

export interface FaqItem {
  question: string;
  /** 文章のほか、リンクなどの要素も書ける。文字列の改行はそのまま表示される */
  answer: ReactNode;
}

/**
 * FAQ ページに表示する質問と回答。上から順に表示する。
 *
 * 書き方の例:
 *   {
 *     question: "毎日何時に問題が変わりますか?",
 *     answer: "日本時間の0時に新しい問題になります。",
 *   },
 */
export const FAQ_ITEMS: readonly FaqItem[] = [];
