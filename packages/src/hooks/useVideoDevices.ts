import { useEffect, useState } from "react";

export const useVideoDevices = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]|null>(null);
  useEffect(()=>{
    getVideoDevices().then((devides) => {
      setVideoDevices(()=>devides);
    });
  }, [])
  return videoDevices;
}

export const getVideoDevices = async () =>{
  const devices = await navigator.mediaDevices.enumerateDevices().catch(
    (err) => {
      console.error('Error getting devices', err);
      return [];
    }
  );
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  return videoDevices;
}
