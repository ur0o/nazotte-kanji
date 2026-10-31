import { Anchor, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import classes from "./Top.module.css";

/** 基本的なライセンス情報と、FAQ・クレジットページへのリンク */
export function Credits() {
  return (
    <Text component="footer" size="xs" c="dimmed" className={classes.credits}>
      出題データ: CC BY-SA 4.0 ・ プログラム: MIT License ・{" "}
      <Anchor
        renderRoot={(props) => <Link to="/faq" {...props} />}
        underline="always"
        inherit
      >
        FAQ
      </Anchor>{" "}
      ・{" "}
      <Anchor
        renderRoot={(props) => <Link to="/credits" {...props} />}
        underline="always"
        inherit
      >
        クレジット
      </Anchor>
    </Text>
  );
}
