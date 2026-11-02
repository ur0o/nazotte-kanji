import { Anchor } from "@mantine/core";
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
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Q. この画の終わり方とか角度とか違うんじゃない？",
    answer: (
      <div>
        A.{" "}
        <Anchor
          href="https://x.com/ur0o0o0o0o0n"
          target="_blank"
          rel="noopener noreferrer"
          inherit
        >
          作者のX
        </Anchor>
        へ、スクショと一緒にご報告ください。
        その他、意見・感想等もお待ちしています。
      </div>
    ),
  },
  {
    question: "Q. 漢字はわかったけど、読み方がわからなくて入力できません。",
    answer:
      "A. 文字を分解して検索すると大体出てきます。（例）「秋」を「のぎへんに火」",
  },
  {
    question: "Q. 配信は可能ですか？",
    answer: (
      <div>
        A. 可能です。
        以下の記述を概要欄に載せるほか、ネタバレ（主に今日の1文字）への配慮をお願いします。
        ----- nazotte漢字 https://ur0o.github.io/nazotte-kanji/ クレジット
        https://ur0o.github.io/nazotte-kanji/credits -----
      </div>
    ),
  },
];
