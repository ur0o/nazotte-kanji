import { Button, Group } from "@mantine/core";
import type { DrawingLine } from "./DrawingCanvas.tsx";

export namespace DrawingTools {
  export interface Props {
    lines: readonly DrawingLine[];
    onLinesChange: (lines: DrawingLine[]) => void;
  }
}

export function DrawingTools({ lines, onLinesChange }: DrawingTools.Props) {
  const empty = lines.length === 0;
  return (
    <Group justify="flex-end" gap="xs" my="xs">
      <Button
        variant="default"
        size="xs"
        disabled={empty}
        onClick={() => onLinesChange(lines.slice(0, -1))}
      >
        元に戻す
      </Button>
      <Button
        variant="default"
        size="xs"
        disabled={empty}
        onClick={() => onLinesChange([])}
      >
        全部消す
      </Button>
    </Group>
  );
}
