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
      <Section title="利用データ">
        以下のデータを利用して出題データを作成しています。
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
            （取得元）
            <ExternalLink href="https://github.com/davidluzgouveia/kanji-data">
              davidluzgouveia/kanji-data
            </ExternalLink>
          </List.Item>
        </List>
      </Section>
      <Section title="ライセンス">
        <Text size="sm">
          出題データは、
          <ExternalLink href={CC_BY_SA_4}>CC BY-SA 4.0</ExternalLink>
          のもとで利用できます。
        </Text>
      </Section>
    </Stack>
  );
}
