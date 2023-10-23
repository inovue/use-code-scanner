import { ready, ScanResult } from 'qr-scanner-wechat'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { FeatureProps } from './features'
import { getStatus, listVideoInputDevices } from '@/utils/scanner'

import decoderWorker from "./decoder.worker?worker";

export interface Scanner {
  status: ScannerStatus;
  element:{
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
  }
}

export type ScannerCoreProps = {
  autoPlay?: boolean,
  constraints?: MediaStreamConstraints,
  features?: React.ComponentType<FeatureProps>[]
}

const defaultConstraints: MediaStreamConstraints = {
  audio: false,
  video: {
    width: 256,
    height: 256,
    facingMode: 'environment',
  },
}

export type ScannerStatus = {
  state: string|null,
  video:{
    width: number,
    height: number,
    capabilities: MediaTrackCapabilities|null,
    constraint: MediaTrackConstraints|null,
    settings: MediaTrackSettings|null
  },
  canvas:{
    width: number,
    height: number,
  },
} 


export default function ScannerCore({autoPlay=false, constraints=defaultConstraints, features=[]}: ScannerCoreProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const [status, setStatus] = useState<ScannerStatus|null>(null);
  
  const workerThreads = useRef<{id:number, worker:Worker, status:string}[]>([]);

  const scanner = useMemo<Scanner>(()=>({
    status: status!,
    element: {
      video: videoRef.current!,
      canvas: canvasRef.current!,
    }
  }), [status]);


  useEffect(() => {
    //workerRef.current = new decoderWorker();
    [...Array(8)].forEach((_, i)=> workerThreads.current.push({id:i, worker: new decoderWorker(), status: ''}));
    workerThreads.current.forEach((thread)=>{
      thread.worker.onmessage = (event:MessageEvent<{id:number, result:ScanResult}>) => {
        const data = event.data;
        workerThreads.current[data.id].status = '';
        console.log("メインスレッドで受信:", data.result.text);
      };
    });

    setStatus(getStatus(videoRef.current!, canvasRef.current!));

    return () => {
      workerThreads.current.forEach((thread)=>thread.worker.terminate());
    };
  }, [])

  useEffect(() => {
    console.log('status', status)
  }, [status])

  const handleOnStateChanged:EventListener = (event) => {
    setStatus(getStatus(videoRef.current!, canvasRef.current!, event))
  }
  
  const handleOnResized:EventListener = (event) => {
    setStatus(getStatus(videoRef.current!, canvasRef.current!, event))
  }


  useEffect(() => {
    (async ()=>{
      const video = videoRef.current;
      if (!video) return;
      
      video.addEventListener('play', handleOnStateChanged);
      video.addEventListener('playing', handleOnStateChanged);
      video.addEventListener('pause', handleOnStateChanged);
      video.addEventListener('emptied', handleOnStateChanged);
      video.addEventListener('loadedmetadata', handleOnStateChanged);
      video.addEventListener('resize', handleOnResized);

      setDevices(await listVideoInputDevices());

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await ready();
      setIsReady(true);
      autoPlay && await video.play();
    })();
  }, []);

  function scanFrame() {
    console.log('scanFrame')
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if(!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    workerThreads.current.find((thread)=>thread.status === '')?.worker.postMessage(imageData);
    workerRef.current && workerRef.current.postMessage(imageData);
  
  }
  
  useInterval(()=>{
    scanFrame()
  }, (isReady && status?.state === 'playing' ) ? 100 : null)

  
  return (
    <>
      {!isReady && <p>Loading...</p>}
      <div>
        <ul>
          {devices.map((device, i)=>(
            <li key={i}>{device.deviceId}</li>
          ))}
        </ul>
      </div>
      <div className='scnner-wrapper'>
        <video ref={videoRef} />
        <canvas ref={canvasRef} />
      </div>
      
      {status && features.map((Feature, index)=>(
        <Feature key={index} scanner={scanner} />
      ))}
    </>
    
  )
}


