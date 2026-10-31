import { ActionIcon, Button, Container, Group, Title } from "@mantine/core";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { HowToModal } from "../components/HowToModal.tsx";
import { hasSeenHowTo, markHowToSeen } from "../lib/how-to-seen.ts";
import { MODE_LABELS, modeOfPath } from "../lib/modes.ts";
import classes from "./AppLayout.module.css";

/** ゲーム画面以外のページのタイトル(トップは「漢字謎り」) */
const PAGE_TITLES: Readonly<Record<string, string>> = {
  "/faq": "FAQ",
  "/credits": "クレジット",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const isTop = pathname === "/";
  const mode = modeOfPath(pathname);
  // 初めて訪れたときは遊び方を自動で開く
  const [howToOpened, setHowToOpened] = useState(() => !hasSeenHowTo());

  const closeHowTo = () => {
    markHowToSeen();
    setHowToOpened(false);
  };

  return (
    <Container size={480} px="md" className={classes.root}>
      <Group component="header" className={classes.header} justify="center">
        {!isTop && (
          <ActionIcon
            renderRoot={(props) => <Link to="/" {...props} />}
            variant="subtle"
            size="lg"
            aria-label="トップへ戻る"
            className={classes.back}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ActionIcon>
        )}
        {mode || PAGE_TITLES[pathname] ? (
          <Title order={1} className={classes.title}>
            {mode ? MODE_LABELS[mode] : PAGE_TITLES[pathname]}
          </Title>
        ) : (
          <Title order={1} className={`${classes.title} ${classes.appName}`}>
            漢字謎り
          </Title>
        )}
        <Button
          variant="subtle"
          size="compact-sm"
          className={classes.actions}
          onClick={() => setHowToOpened(true)}
        >
          遊び方
        </Button>
      </Group>
      <HowToModal opened={howToOpened} onClose={closeHowTo} />
      <main>
        <Outlet />
      </main>
    </Container>
  );
}
