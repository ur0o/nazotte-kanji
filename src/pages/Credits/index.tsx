import { Anchor, List, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Anchor
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      underline="always"
      inherit
    >
      {children}
    </Anchor>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="xs" component="section">
      <Title order={2} size="h4">
        {title}
      </Title>
      {children}
    </Stack>
  );
}

const CC_BY_SA_3 = "https://creativecommons.org/licenses/by-sa/3.0/deed.ja";
const CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/deed.ja";

/** 元データの出典、加工の内容、ライセンス */
export function CreditsPage() {
  return (
    <Stack gap="xl" py="md">
      <Section title="出題データの元データ">
        <Text size="sm">
          このクイズの出題データは、次のデータを元に作成しています。
        </Text>
        <List size="sm" spacing="xs">
          <List.Item>
            <Text size="sm" fw={700} span>
              <ExternalLink href="https://kanjivg.tagaini.net/">
                KanjiVG
              </ExternalLink>
            </Text>
            :書き順と各画の線
            <br />© Ulrich Apel、
            <ExternalLink href={CC_BY_SA_3}>CC BY-SA 3.0</ExternalLink>
          </List.Item>
          <List.Item>
            <Text size="sm" fw={700} span>
              <ExternalLink href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project">
                KANJIDIC2
              </ExternalLink>
            </Text>
            :読みと常用漢字の一覧
            <br />© Electronic Dictionary Research and Development Group、
            <ExternalLink href={CC_BY_SA_4}>CC BY-SA 4.0</ExternalLink>
            <br />
            JSON に変換した
            <ExternalLink href="https://github.com/davidluzgouveia/kanji-data">
              davidluzgouveia/kanji-data
            </ExternalLink>
            を経由して取得しています。
          </List.Item>
        </List>
      </Section>
      <Section title="加工の内容">
        <List size="sm" spacing="xs">
          <List.Item>
            KanjiVG
            の各画の線から、画の終わる位置と、終わるときの向き(8方向)を求めました
          </List.Item>
          <List.Item>
            KanjiVG
            の画の種類から各画の終わり方(とめ・はね・はらい)を推定しました。推定の誤りは手で修正することがあります
          </List.Item>
          <List.Item>
            KANJIDIC2
            の読みのうち、音読みをカタカナに直し、常用漢字の分だけを取り出しました
          </List.Item>
        </List>
      </Section>
      <Section title="ライセンス">
        <Text size="sm">
          出題データ(上記の元データを加工したもの)は、
          <ExternalLink href={CC_BY_SA_4}>CC BY-SA 4.0</ExternalLink>
          のもとで利用できます。
        </Text>
        <Text size="sm">
          プログラムは
          <ExternalLink href="https://opensource.org/license/mit">
            MIT License
          </ExternalLink>
          です。© 2026 ur0o
        </Text>
      </Section>
    </Stack>
  );
}
