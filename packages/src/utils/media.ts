import { scanImageData } from '@undecaf/zbar-wasm';
import { createRef } from 'react';


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


export type CodeScannerOptions = {
  sleep: number;
  interval: number;
  autoPlay: boolean;
  facingMode: ConstrainDOMString;
};

export class CodeScanner {
  private _video: React.RefObject<HTMLVideoElement>;
  private _canvas: React.RefObject<HTMLCanvasElement>;
  private _scanId: number | null = null;
  private _sleepId: number | null = null;

  constructor( options: CodeScannerOptions) {
    this._video = createRef<HTMLVideoElement>();
    this._canvas = createRef<HTMLCanvasElement>();

    navigator.mediaDevices.getUserMedia({video:{facingMode:options.facingMode}}).then((stream) => {
      console.log('stream', stream);
      if(this._video.current) this._video.current.srcObject = stream;
      this.setCanvas();
    });
  }

  private setCanvas() {
    if(this._video.current && this._canvas.current){
      this._canvas.current.width = this._video.current.videoWidth;
      this._canvas.current.height = this._video.current.videoHeight;
    }

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
    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{zoom:value}]})
  }

  get torch(){
    return this.constraints?.advanced?.[0].torch || null;
  }
  set torch(value:boolean|null) {
    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{torch:value}]})
  }

  get play() {
    return !this._video.paused;
  }
  set play(value:boolean) {
    if(value){
      this._video.play().then(()=>{
        this.scan(true);
      });
    }else{
      this.scan(false);
      this._video.pause();
    }
  }


  private scan(value:boolean) {
    if(value){
      if(!this._scanId){
        this._scanId = setInterval(() => this.decode(), 500);
      }
      if(!this._sleepId){
        this._sleepId = setTimeout(() => { this.play = false; }, 5000);
      }
    }else{
      if(this._scanId){
        clearInterval(this._scanId);
        this._scanId = null;
      }
      if(this._sleepId){
        clearTimeout(this._sleepId);
        this._sleepId = null;
      }
    }
  }

  private async decode(){
    const canvasContext = this._canvas.getContext('2d');
    if (!canvasContext) return [];
    canvasContext.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);
    const imageData = canvasContext.getImageData(0, 0, this._canvas.width, this._canvas.height);
    const symbols = await scanImageData(imageData);
    const results = symbols.map(symbol => symbol.decode());
    return results;
  }
}

