import { ready, scan } from 'qr-scanner-wechat'
import { useEffect, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    (async ()=>{
      const video = videoRef.current;
      if (!video) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: 256,
          height: 256,
          facingMode: 'environment',
        },
      });
      video.srcObject = stream;
      await ready();
      setIsReady(true);
      await video.play();
      
    })()
  }, []);

  async function scanFrame() {
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
  }
  
  useInterval(()=>{
    scanFrame()
  }, isReady ? 100 : null)

  return (
    <>
      {!isReady && <p>Loading...</p>}
      <video ref={videoRef} id="video" />
      <canvas ref={canvasRef} id="canvas" />
    </>
    
  )
}


