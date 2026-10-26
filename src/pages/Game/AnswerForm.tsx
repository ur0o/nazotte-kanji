import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { KeyboardEvent } from "react";
import { ANSWER_ERROR_MESSAGES, validateAnswer } from "../../lib/answer.ts";
import { useGame } from "./GameContext.tsx";

export namespace AnswerForm {
  export interface Props {
    jouyou: ReadonlySet<string>;
  }
}

export function AnswerForm({ jouyou }: AnswerForm.Props) {
  const { round, submitGuess } = useGame();
  const form = useForm({
    mode: "controlled",
    initialValues: { answer: "" },
    validateInputOnChange: false,
    validate: {
      answer: (value) => {
        const error = validateAnswer(value, jouyou, round.guesses);
        return error ? ANSWER_ERROR_MESSAGES[error] : null;
      },
    },
  });

  // 日本語入力の変換を確定する Enter では送信しない
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      event.key === "Enter" &&
      (event.nativeEvent.isComposing || event.keyCode === 229)
    ) {
      event.preventDefault();
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(({ answer }) => {
        submitGuess(answer.trim());
        form.reset();
      })}
    >
      <Group align="flex-start" gap="xs" wrap="nowrap">
        <TextInput
          {...form.getInputProps("answer")}
          key={form.key("answer")}
          onKeyDown={handleKeyDown}
          placeholder="漢字を1文字"
          aria-label="回答"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          size="md"
          style={{ flex: 1 }}
        />
        <Button type="submit" size="md">
          回答
        </Button>
      </Group>
    </form>
  );
}
