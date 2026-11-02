import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useGame } from "./GameContext.tsx";
import classes from "./RetireButton.module.css";

/** リタイアのボタンと、その確認モーダル */
export function RetireButton() {
  const { mode, retire } = useGame();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className={classes.root}>
        <Button
          variant="subtle"
          color="gray"
          size="compact-xs"
          onClick={() => setConfirming(true)}
        >
          リタイア
        </Button>
      </div>
      <Modal
        opened={confirming}
        onClose={() => setConfirming(false)}
        title="リタイアしますか?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {mode.type === "daily"
              ? "この問題は不正解になり、今日はこの難易度にもう挑戦できません。"
              : "この問題は不正解になり、連続正解はここで終わります。"}
          </Text>
          <Group grow>
            <Button variant="default" onClick={() => setConfirming(false)}>
              キャンセル
            </Button>
            <Button
              color="red"
              onClick={() => {
                setConfirming(false);
                retire();
              }}
            >
              リタイアする
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
