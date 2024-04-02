import { CodeScannerController } from "../../libs/CodeScannerController";

export type ZoomSliderProps= {
  scanner: CodeScannerController;
};
export const ZoomSlider = ({scanner}: ZoomSliderProps) => {
  const onChange:React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    if(scanner.zoom !== null){
      scanner.zoom = Number(event.target.value);
    }
  }
  return (
    <input type="range" {...scanner.zoom} onChange={onChange} />
  );
}
