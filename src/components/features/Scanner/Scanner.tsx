import { scan } from 'qr-scanner-wechat'
import { useEffect, useRef } from 'react'

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async ()=>{
      if (!videoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: 512,
          height: 512,
        },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    })()
  }, []);

  async function scanFrame() {
    if(!videoRef.current || !canvasRef.current) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    const result = await scan(canvasRef.current)
  
    if (result?.text)
      alert(result?.text)
  }
  
  setInterval(scanFrame, 100) 

  return (
    <>
      <video ref={videoRef} id="video" />
      <canvas id="canvas" />
    </>
    
  )
}


