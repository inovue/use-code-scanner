import { useRef, useEffect, useState } from 'react';
import { CodeScanner, type CodeScannerOptions } from '../utils/media';

const defaultOptions: CodeScannerOptions = {
  sleep: 5000,
  interval: 500,
  autoPlay: true,
  facingMode: 'environment',
};

export function useCodeScanner(options: CodeScannerOptions = defaultOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [controller, setController] = useState<CodeScanner|null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvasRef.current || !videoRef.current) return;

    setController(()=>new CodeScanner(options))
  }, [options]);

  const Scanner = () => {
    return (
      <div className='code-scanner' style={containerStyle}>
        <video className='code-scanner-video' style={videoStyle} ref={videoRef} playsInline />
        <canvas className='code-scanner-canvas' style={cavasStyle} ref={canvasRef} />
      </div>
    )
  };

  const containerStyle:React.CSSProperties = {
    width: 'auto',
    maxWidth: '100%',
    height: '100%',
    position: 'absolute',
    margin: 'auto',
    left: 0,
    right: 0,
  }
  const videoStyle:React.CSSProperties = {
    width: '100%',
    height: '100%',
  }
  const cavasStyle:React.CSSProperties = {
    //display: 'none',
  }
  return {Scanner, controller};
}


