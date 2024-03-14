import { scanImageData } from '@undecaf/zbar-wasm';

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

export const getDevices = async () =>{
  const devices = await navigator.mediaDevices.enumerateDevices().catch(
    (err) => {
      console.error('Error getting devices', err);
      return [];
    }
  );
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  return videoDevices;
}

export class CodeScanner {
  private _video: HTMLVideoElement;
  private _canvas: HTMLCanvasElement;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this._video = video;
    this._canvas = canvas;
  }
  get track() {
    const tracks = (this._video.srcObject as MediaStream).getTracks();
    return tracks.length > 0 ? tracks[0] : null;
  }

  get capabilities() {
    return this.track ? this.track.getCapabilities() as MediaTrackAdvancedCapabilities : null;
  }

  get constraints() {
    return this.track ? this.track.getConstraints() as MediaTrackAdvancedConstraints : null;
  }

  get zoom(){
    return this.constraints?.advanced?.[0].zoom || null;
  }
  set zoom(value:ConstrainDouble|null) {
    // Implementation needed
  }

  get torch(){
    return this.constraints?.advanced?.[0].torch || null;
  }
  set torch(value:boolean|null) {
    // Implementation needed
  }


  async scan(){
    const canvasContext = this._canvas.getContext('2d');
    if (!canvasContext) return [];
    canvasContext.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);
    const imageData = canvasContext.getImageData(0, 0, this._canvas.width, this._canvas.height);
    const symbols = await scanImageData(imageData);
    const results = symbols.map(symbol => symbol.decode());
    return results;
  }
}
