import { CodeScannerController } from "../../libs/CodeScannerController";

export type TorchButtonProps= {
  scanner: CodeScannerController;
};
export const TorchButton = ({scanner}: TorchButtonProps) => {
  const onClick = () => {
    if(scanner.torch !== null){
      scanner.torch = !scanner.torch;
    }
  }
  return (
    <button onClick={onClick}>{scanner.torch?'Off':'On'}</button>
  );
}
