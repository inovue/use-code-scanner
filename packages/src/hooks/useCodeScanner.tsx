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
    if (!video || !canvas) return;

    setController(()=>new CodeScanner(video, canvas, options))
  }, [options]);

  const Scanner = () => {
    return (
      <div className='code-scanner'>
        <video className='code-scanner-video' ref={videoRef} />
        <canvas className='code-scanner-canvas' ref={canvasRef} />
      </div>
    )
  };

  return {Scanner, controller};
}


