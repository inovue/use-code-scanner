import { useEffect, useState } from "react";

export const useVideoDevices = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]|null>(null);
  useEffect(()=>{
    (async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(()=>mediaDevices.filter(mediaDevice => mediaDevice.kind === 'videoinput'));
    })();
  }, [])
  return videoDevices;
}
