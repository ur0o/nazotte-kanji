import { Modal } from "@mantine/core";
import { SymbolGuide } from "./SymbolGuide.tsx";

export namespace SymbolGuideModal {
  export interface Props {
    opened: boolean;
    onClose: () => void;
  }
}

export function SymbolGuideModal({ opened, onClose }: SymbolGuideModal.Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="記号の見方" centered>
      <SymbolGuide />
    </Modal>
  );
}
