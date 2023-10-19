import { ready, scan } from 'qr-scanner-wechat'
import {  useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { ControllerProps } from './controllers'
import { listVideoInputDevices } from '@/utils/scanner'

export type Scanner = {
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  isReady: boolean
  status: ScannerStatus
}

export type ScannerCoreProps = {
  autoPlay?: boolean,
  constraints?: MediaStreamConstraints,
  controllers?: React.ComponentType<ControllerProps>[]
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

const getScannerStatus = (video: HTMLVideoElement, canvas: HTMLCanvasElement, event?:Event):ScannerStatus => {
  const { videoWidth, videoHeight, srcObject } = video;
  const { width: canvasWidth, height: canvasHeight } = canvas;
  
  let capabilities: MediaTrackCapabilities|null = null
  let constraint: MediaTrackConstraints|null = null
  let settings: MediaTrackSettings|null = null

  if(video.srcObject){
    const tracks = (srcObject as MediaStream).getVideoTracks();
    if(tracks.length){
      const track = tracks[0];
      capabilities = track.getCapabilities();
      constraint = track.getConstraints();
      settings = track.getSettings();
    }
  }
  
  return {
    state: event?.type || null,
    video:{
      width: videoWidth,
      height: videoHeight,
      capabilities,
      constraint,
      settings
    },
    canvas:{
      width: canvasWidth,
      height: canvasHeight,
    },
  };
}


export default function ScannerCore({autoPlay=false, constraints=defaultConstraints, controllers=[]}: ScannerCoreProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const [status, setStatus] = useState<ScannerStatus|null>(null);
  
  const controllerProps = useMemo<ControllerProps>(()=>({
    status: status!,
    element: {
      video: videoRef.current!,
      canvas: canvasRef.current!,
    }
  }), [status])


  useEffect(() => {
    setStatus(getScannerStatus(videoRef.current!, canvasRef.current!))
  }, [])

  useEffect(() => {
    console.log('status', status)
  }, [status])

  const handleOnStateChanged:EventListener = (event) => {
    setStatus(getScannerStatus(videoRef.current!, canvasRef.current!, event))
  }
  
  const handleOnResized:EventListener = (event) => {
    setStatus(getScannerStatus(videoRef.current!, canvasRef.current!, event))
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

  async function scanFrame() {
    console.log('scanFrame')
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if(!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const timestamp = Date.now();
    console.time(`scan-${timestamp}`);
    const result = await scan(canvas)
    console.timeEnd(`scan-${timestamp}`);
    
    //const result = {text: ''}
    if (result?.text) alert(result?.text);
  }
  
  useInterval(()=>{
    (async () => await scanFrame())()
  }, (isReady ) ? 100 : null)

  
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
      
      {status && controllers.map((Controller, index)=>(
        <Controller key={index} {...controllerProps} />
      ))}
    </>
    
  )
}


