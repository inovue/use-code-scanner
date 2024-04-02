import { useCallback, useRef, useState } from "react";
import { CodeScannerController, CodeScannerControllerOptions, defaultId, defaultOptions } from "../libs/CodeScannerController";
import { PlayButton } from "./features/PlayButton";
import { TorchButton } from "./features/TorchButton";
import { ZoomSlider } from "./features/ZoomSlider";

export type CodeScannerProps = {
  id?: string;
  options?: CodeScannerControllerOptions;
};

export const CodeScanner = ({id=defaultId, options=defaultOptions}: CodeScannerProps) => {
  const ref = useRef<CodeScannerController|null>(null);
  const [, forceRender] = useState(true);

  const instantiateController = useCallback((node:HTMLDivElement) => {
    if (node !== null && ref.current === null) {
      ref.current = new CodeScannerController(id, options);
      ref.current.addObserver(
        (propertyName: string, oldValue, newValue) => {
          console.log(propertyName, oldValue, newValue);
          console.info('scanner', ref.current);
          forceRender(n => !n);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "90dvh",
    backgroundColor:'#333'
  };

  return (
    <>
      <div id={id} style={containerStyle} ref={instantiateController}>
      </div>
      {ref.current && <PlayButton scanner={ref.current} />}
      {ref.current && ref.current.torch !== null && <TorchButton scanner={ref.current} />}
      {ref.current && ref.current.zoom !== null && <ZoomSlider scanner={ref.current} />}
    </>
  );
};
