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
          forceRender(n => !n);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100dvh",
    backgroundColor:'#333'
  };

  return (
    <>
      <div id={id} style={containerStyle} ref={instantiateController}>
      </div>
      {ref.current &&
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <ZoomSlider scanner={ref.current} />
          </div>
          <PlayButton scanner={ref.current} />
          <TorchButton scanner={ref.current} />
        </div>
      }
    </>
  );
};
