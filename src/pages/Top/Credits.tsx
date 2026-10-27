import { Anchor, Text } from "@mantine/core";
import classes from "./Top.module.css";

/** 元データの出典とライセンス(どちらも CC BY-SA のため表示が必要) */
export function Credits() {
  const link = (href: string, label: string) => (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" inherit>
      {label}
    </Anchor>
  );
  return (
    <Text component="footer" size="xs" c="dimmed" className={classes.credits}>
      書き順と字形のデータ: {link("https://kanjivg.tagaini.net/", "KanjiVG")} ©
      Ulrich Apel(
      {link("https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 3.0")}
      )。読み:{" "}
      {link(
        "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
        "KANJIDIC2",
      )}{" "}
      © EDRDG(
      {link("https://creativecommons.org/licenses/by-sa/4.0/", "CC BY-SA 4.0")}
      )。これらを元にした出題データは CC BY-SA 4.0 で配布しています。
    </Text>
  );
}
