import { useRef, useEffect, useState, useMemo } from 'react';
import { useVideoDevices } from './useVideoDevices';
import { getTrack, getZoomValue } from '../utils/media';
import { scanImageData } from '@undecaf/zbar-wasm';

export type UseCodeScannerOptions = {
  autoPlay?: boolean;
  facingMode?: ConstrainDOMString;
};

export function useCodeScanner(options: UseCodeScannerOptions = {autoPlay: true, facingMode: 'environment'}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean|null>(null);
  const [isTorched, setIsTorched] = useState<boolean|null>(null);
  const [zoomValue, setZoomValue] = useState<number|null>(null);

  const devices = useVideoDevices();

  const play = (value:boolean) => {
    const video = videoRef.current;
    if (video !== null && isPlaying !== null){
      value ? video.play() : video.pause();
    }
  }

  const initCanvas = (video:HTMLVideoElement,  canvas:HTMLCanvasElement) => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const scan = async (video:HTMLVideoElement,  canvas:HTMLCanvasElement) => {
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return null;
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const symbols = await scanImageData(imageData);
    const results = symbols.map(symbol => symbol.decode());
    return results;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices.getUserMedia({video:{facingMode:options.facingMode}}).then((stream) => {
      video.srcObject = stream;
    });

    options.autoPlay && video.play();

    video.onload = () => {
      const track = getTrack(video);
      if(track){
        setZoomValue(()=>getZoomValue(track))
      }
    }
    video.onplay = () => {
      setIsPlaying(()=>true);
      setIsPaused(()=>false);
    };
    video.onpause = () => {
      setIsPlaying(()=>false);
      setIsPaused(()=>true);
    };
  }, [videoRef]);

  const CodeScanner = (
    <div className='code-scanner'>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
    </div>
  );

  return [CodeScanner, play, devices]

}


