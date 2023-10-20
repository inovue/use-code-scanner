import { ScannerStatus } from '@/components/Scanner';

export const listVideoInputDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  return videoDevices;
}

export const getStatus = (video: HTMLVideoElement, canvas: HTMLCanvasElement, event?:Event):ScannerStatus => {
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