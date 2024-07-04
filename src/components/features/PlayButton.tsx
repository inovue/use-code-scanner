import { CodeScannerController } from "../../libs/CodeScannerController";

export type PlayButtonProps= {
  scanner: CodeScannerController;
};
export const PlayButton = ({scanner}: PlayButtonProps) => {
  const onClick = () => {
    scanner.play = !scanner.play;
  }
  return (
    <button onClick={onClick}>{scanner.play?'Pause':'Play'}</button>
  );
}
