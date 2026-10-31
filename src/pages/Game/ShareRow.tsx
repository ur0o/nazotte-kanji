import { ActionIcon, Button, Text } from "@mantine/core";
import { useState } from "react";
import { xShareUrl } from "../../lib/share.ts";
import classes from "./ShareRow.module.css";

export namespace ShareRow {
  export interface Props {
    /** シェアする文章 */
    text: string;
  }
}

/** X のロゴ */
function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

/**
 * 「SNSにシェア」の見出しと、小さなコピーのボタン・X のボタン。
 * 結果モーダルの「トップへ」などの大きなボタンと見分けがつくよう、小さくまとめる
 */
export function ShareRow({ text }: ShareRow.Props) {
  // 一度コピーしたら、モーダルを閉じるかページを移る(この部品がなくなる)まで「コピーしました」のまま
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // コピーできない環境では表示を変えない
    }
  };

  return (
    <div className={classes.root}>
      <Text size="xs" c="dimmed" className={classes.label}>
        SNSにシェア
      </Text>
      <Button
        variant="default"
        size="compact-sm"
        radius="xl"
        onClick={copy}
        className={classes.copy}
      >
        {copied ? "コピーしました" : "コピー"}
      </Button>
      <ActionIcon
        component="a"
        href={xShareUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        size={28}
        radius="xl"
        className={classes.x}
        aria-label="X に投稿"
      >
        <XLogo />
      </ActionIcon>
    </div>
  );
}
