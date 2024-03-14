export interface MediaTrackAdvancedCapabilities extends MediaTrackCapabilities {
  torch?:boolean;
  zoom?:DoubleRange & {step?:number};
}

export interface MediaTrackAdvancedConstraintSet extends MediaTrackConstraintSet {
  torch?:boolean;
  zoom?:ConstrainDouble;
}

export interface MediaTrackAdvancedConstraints extends MediaTrackConstraints {
  advanced?: MediaTrackAdvancedConstraintSet[];
}


export const getDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices().catch(
    (err) => {
      console.error('Error getting devices', err);
      return [];
    }
  );
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  return videoDevices;
}

export const getTrack = (video:HTMLVideoElement) => {
  const tracks = (video.srcObject as MediaStream).getTracks();
  return tracks.length > 0 ? tracks[0] : null;
}

export const getMediaTrackCapabilities = (video:HTMLVideoElement) => {
  const track = getTrack(video);
  return track ? track.getCapabilities() as MediaTrackAdvancedCapabilities : null;
}

export const getMediaTrackConstraints = (video:HTMLVideoElement) => {
  const track = getTrack(video);
  return track ? track.getConstraints() as MediaTrackAdvancedConstraints : null;
}

export const getZoomValue = (video:HTMLVideoElement) => {
  const constraints = getMediaTrackConstraints(video);
  return constraints;
}
