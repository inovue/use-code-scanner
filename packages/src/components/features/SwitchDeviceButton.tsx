import { useMemo } from "react";
import { CodeScannerController } from "../../libs/CodeScannerController";

export type SwitchDeviceButtonProps= {
  scanner: CodeScannerController;
};
export const SwitchDeviceButton = ({scanner}: SwitchDeviceButtonProps) => {
  const disabled = useMemo(() => scanner.torch === null, [scanner.torch]);
  const onClick = () => {
    if(scanner.torch !== null){
      scanner.torch = !scanner.torch;
    }
  }
  return (
    <button disabled={disabled} onClick={onClick}>{scanner.torch?'Off':'On'}</button>
  );
}
