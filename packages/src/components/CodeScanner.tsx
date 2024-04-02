import { useCallback, useEffect, useRef, useState } from "react";
import { CodeScannerController, CodeScannerControllerOptions, defaultId, defaultOptions } from "../libs/CodeScannerController";
import { PlayButton } from "./features/PlayButton";

export type CodeScannerProps = {
  id?: string;
  options?: CodeScannerControllerOptions;
};

export const CodeScanner = ({id=defaultId, options=defaultOptions}: CodeScannerProps) => {
  const [, forceRender] = useState(true);
  const ref = useRef<CodeScannerController|null>(null);
  useEffect(() => {
    //if (ref.current === null) ref.current = new CodeScannerController(id, options);
    /*
    const controller = ref.current;

    // Timeout to allow the clean-up function to finish in case of double render.
    setTimeout(() => {
      const container = document.getElementById(id);
      if (controller && container?.innerHTML == "") {
        controller.render(qrCodeSuccessCallback, qrCodeErrorCallback);
      }
    }, 0);

    return () => {
      if (controller) {
        controller.clear();
      }
    };
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
    height: "90dvh",
    backgroundColor:'#333'
  };

  return (
    <>
      <div id={id} style={containerStyle} ref={instantiateController} >

      </div>
      {ref.current && <PlayButton scanner={ref.current} />}
    </>
  );
};
