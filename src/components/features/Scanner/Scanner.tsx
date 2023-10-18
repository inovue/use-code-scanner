import { ready, scan } from 'qr-scanner-wechat'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { ControllerProps } from './controllers'
import { listVideoInputDevices } from '@/utils/scanner'

export type Scanner = {
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  isReady: boolean
}

export type ScannerCoreProps = {
  autoPlay?: boolean,
  constraints?: MediaStreamConstraints,
  controllers?: React.ComponentType<ControllerProps>[]
}

const handleOnStateChanged:EventListener = (e) => {
  e.target
  console.log('handleOnStateChanged', e)
}

function handleOnResized(e: Event) {
  console.log('handleOnResized', e)
}

const defaultConstraints: MediaStreamConstraints = {
  audio: false,
  video: {
    width: 256,
    height: 256,
    facingMode: 'environment',
  },
}

export default function ScannerCore({autoPlay=false, constraints=defaultConstraints, controllers=[]}: ScannerCoreProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoSetRef = useCallback((node: HTMLVideoElement) => {
    setVideo(node);
  }, []);

  const scanner:Scanner | null = useMemo(()=>{
    if (!videoRef.current || !canvasRef.current) return null;
    return {
      video: videoRef.current,
      canvas: canvasRef.current,
      isReady
    }
  }, [videoRef, canvasRef, isReady])

  useEffect(() => {
    (async ()=>{
      const video = videoRef.current;
      if (!video) return;
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
    const result = await scan(canvas)
    //const result = {text: ''}
    if (result?.text) alert(result?.text);

    video.addEventListener('play', handleOnStateChanged);
    video.addEventListener('playing', handleOnStateChanged);
    video.addEventListener('pause', handleOnStateChanged);
    video.addEventListener('emptied', handleOnStateChanged);
    video.addEventListener('loadedmetadata', handleOnStateChanged);
    video.addEventListener('resize', handleOnResized);
  }
  
  useInterval(()=>{
    scanFrame()
  }, (isReady ) ? 250 : null)

  
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
      
      {scanner && controllers.map((Controller, index)=>(
        <Controller key={index} scanner={scanner} />
      ))}
    </>
    
  )
}


