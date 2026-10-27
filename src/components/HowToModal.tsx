import { Button, List, Modal, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { MAX_GUESSES } from "../lib/answer.ts";

export namespace HowToModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
    /** 記号の見方を開く(遊び方は閉じる) */
    onOpenSymbolGuide: () => void;
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={4}>
      <Title order={3} size="h5">
        {title}
      </Title>
      {children}
    </Stack>
  );
}

/** ルールの説明。記号の詳しい説明は記号の見方モーダルに任せる */
export function HowToModal({
  opened,
  onClose,
  onOpenSymbolGuide,
}: HowToModal.Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="遊び方" centered>
      <Stack gap="md">
        <Text size="sm">
          正方形の中の記号だけを手がかりに、元の漢字を当てるクイズです。
        </Text>
        <Section title="ヒントの見方">
          <Text size="sm">
            記号の位置は、漢字の各画が終わる位置です。記号の形は、その画の終わり方(とめ・はね・はらい)を表します。難易度によって、書き順の番号や、終わるときの向きを示す矢印も付きます。
          </Text>
          <Button
            variant="light"
            size="compact-sm"
            onClick={onOpenSymbolGuide}
            style={{ alignSelf: "flex-start" }}
          >
            記号の見方を開く
          </Button>
        </Section>
        <Section title="回答のしかた">
          <List size="sm" spacing={2}>
            <List.Item>
              下の入力欄に、常用漢字を1文字入れて「回答」を押します
            </List.Item>
            <List.Item>
              1問につき{MAX_GUESSES}
              回まで回答できます。外れた漢字は回答履歴に×付きで残ります
            </List.Item>
            <List.Item>
              常用漢字以外や、もう回答した漢字は回数に数えません
            </List.Item>
          </List>
        </Section>
        <Section title="手書きのメモ">
          <Text size="sm">
            正方形には指やマウスで線を書けます。考えるためのメモで、正解かどうかの判定には使いません。「元に戻す」「全部消す」で消せます。
          </Text>
        </Section>
        <Section title="モード">
          <List size="sm" spacing={2}>
            <List.Item>
              <strong>今日の1字</strong>
              :毎日0時(日本時間)に新しい問題になります。ふつう・難しいに1問ずつあり、それぞれ1日1回挑戦できます。結果はシェアできます
            </List.Item>
            <List.Item>
              <strong>エンドレス</strong>
              :外れるまで問題が続き、連続正解数を競います。いちばん難しい「鬼」も選べます
            </List.Item>
          </List>
        </Section>
        <Button onClick={onClose}>はじめる</Button>
      </Stack>
    </Modal>
  );
}
