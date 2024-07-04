import { useMemo } from "react";
import { CodeScannerController } from "../../libs/CodeScannerController";

export type TorchButtonProps= {
  scanner: CodeScannerController;
};
export const TorchButton = ({scanner}: TorchButtonProps) => {
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
