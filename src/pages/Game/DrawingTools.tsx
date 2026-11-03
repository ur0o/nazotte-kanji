import { Button, Group } from "@mantine/core";
import type { DrawingLine } from "./DrawingCanvas.tsx";
import { SymbolLegend } from "./SymbolLegend.tsx";

export namespace DrawingTools {
  export interface Props {
    lines: readonly DrawingLine[];
    onLinesChange: (lines: DrawingLine[]) => void;
  }
}

export function DrawingTools({ lines, onLinesChange }: DrawingTools.Props) {
  const empty = lines.length === 0;
  return (
    <Group justify="space-between" gap="xs" my="xs">
      <SymbolLegend />
      {/* 狭い画面では凡例の下に回り、右に寄せる */}
      <Group gap="xs" wrap="nowrap" ml="auto">
        <Button
          variant="default"
          size="compact-sm"
          disabled={empty}
          onClick={() => onLinesChange(lines.slice(0, -1))}
        >
          1回戻す
        </Button>
        <Button
          variant="default"
          size="compact-sm"
          disabled={empty}
          onClick={() => onLinesChange([])}
        >
          全部消す
        </Button>
      </Group>
    </Group>
  );
}
