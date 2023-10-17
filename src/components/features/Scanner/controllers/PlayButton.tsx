import { useMemo } from 'react';
import {ControllerProps} from '.'
export const PlayButton = ({scanner}: ControllerProps) => {
  const togglePlay = () => {
    const video = scanner.video;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  const label = useMemo(()=> scanner.video.paused ? 'Play!' : 'Pause', [scanner.video.paused]);

  const onClick = () => togglePlay()
  
  return (
    <button onClick={onClick}>{label}</button>
  )
}