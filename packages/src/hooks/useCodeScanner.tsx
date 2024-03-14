import { useRef, useEffect, useState, useMemo } from 'react';
import { useVideoDevices } from './useVideoDevices';

export type UseCodeScannerOptions = {
  autoPlay?: boolean;
  facingMode?: ConstrainDOMString;
};

export interface MediaTrackAdvancedCapabilities extends MediaTrackCapabilities {
  torch?:boolean;
  zoom?:DoubleRange & {step?:number};
}

export interface MediaTrackAdvancedConstraintSet extends MediaTrackConstraintSet {
  torch?:boolean;
  zoom?:ConstrainDouble;
}

export interface MediaTrackAdvancedConstraints extends MediaTrackConstraints {
  advanced?: MediaTrackAdvancedConstraintSet[];
}

export function useCodeScanner(options: UseCodeScannerOptions = {autoPlay: true, facingMode: 'environment'}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean|null>(null);
  const [isTorched, setIsTorched] = useState<boolean|null>(null);
  const [zoom, setZoom] = useState<number|null>(null);

  const devices = useVideoDevices();

  const play = (value:boolean) => {
    const video = videoRef.current;
    if (video !== null && isPlaying !== null){
      value ? video.play() : video.pause();
    }
  }
  const setZoom = (value:number) => {
    const video = videoRef.current;
    if (video?.srcObject){
      const track = (video.srcObject as MediaStream).getTracks()?.[0];
      (track.getCapabilities() as MediaTrackAdvancedCapabilities).zoom?.max
    }
  }


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices.getUserMedia({video:{facingMode:options.facingMode}}).then((stream) => {
      video.srcObject = stream;
    });

    options.autoPlay && video.play();

    video.onload = () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
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


