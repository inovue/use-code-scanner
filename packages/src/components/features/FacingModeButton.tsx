import { useMemo } from "react";
import { CodeScannerController } from "../../libs/CodeScannerController";

export type FacingModeButtonProps= {
  scanner: CodeScannerController;
};
export const FacingModeButton = ({scanner}: FacingModeButtonProps) => {
  const disabled = useMemo(() => scanner.facingMode === null, [scanner.facingMode]);
  const isFacingModeUser = useMemo(() => scanner.facingMode === 'user', [scanner.facingMode]);
  const onClick = () => {
    if(scanner.facingMode !== undefined){
      scanner.facingMode = isFacingModeUser ? 'environment' : 'user';
    }
  }
  return (
    <button disabled={disabled} onClick={onClick}>{isFacingModeUser?'Front':'Back'}</button>
  );
}
