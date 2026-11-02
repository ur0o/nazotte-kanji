import { Anchor } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import classes from "./Footer.module.css";

/** X(Twitter)アカウントへのリンク。URL と表示する文字を入れると、フッターに表示される */
const X_ACCOUNT_URL = "https://x.com/ur0o0o0o0o0n";
const X_ACCOUNT_LABEL = "uro";

/** 全画面共通のフッター。画面の下端に固定する */
export function Footer() {
  return (
    <footer className={classes.root}>
      <nav className={classes.links} aria-label="サイトの情報">
        {X_ACCOUNT_URL && X_ACCOUNT_LABEL && <>
          作者:
          <Anchor
            href={X_ACCOUNT_URL}
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            {X_ACCOUNT_LABEL}
          </Anchor>
        </>}
        <Anchor renderRoot={(props) => <Link to="/faq" {...props} />} inherit>
          FAQ
        </Anchor>
        <Anchor
          renderRoot={(props) => <Link to="/credits" {...props} />}
          inherit
        >
          クレジット
        </Anchor>
      </nav>
    </footer>
  );
}
