import { ActionIcon, Button, Container, Group, Title } from "@mantine/core";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { SymbolGuideModal } from "../components/SymbolGuideModal.tsx";
import classes from "./AppLayout.module.css";

export function AppLayout() {
  const { pathname } = useLocation();
  const isTop = pathname === "/";
  const [symbolGuideOpened, setSymbolGuideOpened] = useState(false);

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
        <Button
          variant="subtle"
          size="compact-sm"
          className={classes.actions}
          onClick={() => setSymbolGuideOpened(true)}
          aria-label="記号の見方"
        >
          記号
        </Button>
      </Group>
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
