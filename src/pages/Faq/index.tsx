import { Accordion, Text } from "@mantine/core";
import classes from "./Faq.module.css";
import { FAQ_ITEMS } from "./questions.tsx";

/** よくある質問。質問を押すと回答が開く */
export function FaqPage() {
  if (FAQ_ITEMS.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        質問はまだありません
      </Text>
    );
  }
  return (
    <Accordion
      variant="separated"
      multiple
      py="md"
      classNames={{
        item: classes.item,
        control: classes.control,
        label: classes.question,
        content: classes.answer,
      }}
    >
      {FAQ_ITEMS.map((item, index) => (
        <Accordion.Item key={item.question} value={String(index)}>
          <Accordion.Control>{item.question}</Accordion.Control>
          <Accordion.Panel>{item.answer}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
