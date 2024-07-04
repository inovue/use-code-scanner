import { useMemo } from "react";
import { CodeScannerController } from "../../libs/CodeScannerController";

export type ZoomSliderProps= {
  scanner: CodeScannerController;
};
export const ZoomSlider = ({scanner}: ZoomSliderProps) => {
  const disabled = useMemo(() => scanner.zoom === null, [scanner.zoom]);
  const onChange:React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    if(scanner.zoom !== null){
      scanner.zoom = Number(event.target.value);
    }
  }
  return (
    <input disabled={disabled} type="range" {...scanner.zoom} onChange={onChange} />
  );
}
