import {FeatureProps} from './types'
export const PlayButton = ({scanner:{element:{video}}}: FeatureProps) => {
  
  if(!video) return null;
  
  const togglePlay = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  
  const onClick = () => togglePlay()
  
  return (
    <button onClick={onClick}>{video.paused ? 'Play!' : 'Pause'}</button>
  )
}