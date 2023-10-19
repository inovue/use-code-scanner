import { useMemo } from 'react';
import {ControllerProps} from '.'
export const PlayButton = ({element:{video}}: ControllerProps) => {
  const togglePlay = () => {
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  const label = useMemo(()=> video.paused ? 'Play!' : 'Pause', [video.paused]);

  const onClick = () => togglePlay()
  
  return (
    <button onClick={onClick}>{label}</button>
  )
}