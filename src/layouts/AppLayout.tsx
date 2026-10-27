import { ActionIcon, Button, Container, Group, Title } from "@mantine/core";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { HowToModal } from "../components/HowToModal.tsx";
import { SymbolGuideModal } from "../components/SymbolGuideModal.tsx";
import { hasSeenHowTo, markHowToSeen } from "../lib/how-to-seen.ts";
import classes from "./AppLayout.module.css";

export function AppLayout() {
  const { pathname } = useLocation();
  const isTop = pathname === "/";
  const [symbolGuideOpened, setSymbolGuideOpened] = useState(false);
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
        <Title order={1} className={classes.title}>
          漢字書き順クイズ
        </Title>
        <Group gap={4} className={classes.actions}>
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => setSymbolGuideOpened(true)}
            aria-label="記号の見方"
          >
            記号
          </Button>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setHowToOpened(true)}
            aria-label="遊び方"
          >
            <span className={classes.help} aria-hidden>
              ?
            </span>
          </ActionIcon>
        </Group>
      </Group>
      <HowToModal
        opened={howToOpened}
        onClose={closeHowTo}
        onOpenSymbolGuide={() => {
          closeHowTo();
          setSymbolGuideOpened(true);
        }}
      />
      <SymbolGuideModal
        opened={symbolGuideOpened}
        onClose={() => setSymbolGuideOpened(false)}
      />
      <main>
        <Outlet />
      </main>
    </Container>
  );
}
