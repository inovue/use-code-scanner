import { scanImageData } from '@undecaf/zbar-wasm';
import { drawImage } from './drawImage';

type Observer = (<T>(a: string, b: T, c: T) => void);

export class CodeScannerController {
  private _video: HTMLVideoElement;
  private _scanId: number | null = null;
  private _sleepId: number | null = null;

  private observers: Observer[] = [];

  constructor(id:string=defaultId, options: CodeScannerControllerOptions=defaultOptions) {
    const container = document.getElementById(id);
    if(!container) throw new Error(`Element not found: ${id}`);

    this._video = document.createElement('video');
    this._video.playsInline = true;
    this._video.style.width = '100%';
    this._video.style.height = '100%';
    container.appendChild(this._video);


    navigator.mediaDevices.getUserMedia({video:{facingMode:options.facingMode},audio:false}).then((stream) => {
      if(this._video) this._video.srcObject = stream;
      if(options.autoPlay) this.play = true;
    });
  }

  get video(){
    return this._video;
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
    if (this.zoom === value) return;
    this.notifyObserver("zoom", this.zoom, value);

    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{zoom:value}]})
  }

  get torch(){
    return this.constraints?.advanced?.[0].torch || null;
  }

  set torch(value:boolean|null) {
    if (this.torch === value) return;
    this.notifyObserver("torch", this.torch, value);

    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{torch:value}]})
  }

  get play() {
    return !this._video.paused;
  }

  set play(value:boolean) {
    if (this.play === value) return;
    this.notifyObserver("play", this.play, value);

    if(value){
      this._video.play().then(()=>{
        if(!this._scanId) this._scanId = setInterval(() => this.decode(), 500);
        if(!this._sleepId) this._sleepId = setTimeout(() => { this.play = false; }, 5000);
      });

    }else{
      if(this._scanId){
        clearInterval(this._scanId);
        this._scanId = null;
      }
      if(this._sleepId){
        clearTimeout(this._sleepId);
        this._sleepId = null;
      }
      this._video.pause();
    }
  }

  private async decode(){
    console.time("decode");
    const imageData = await drawImage(this._video);
    const symbols = await scanImageData(imageData);
    const results = symbols.map(symbol => symbol.decode());
    console.timeEnd("decode");
    console.log('results', results);
    return results;
  }

  public addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  private notifyObserver<T>(propertyName: string, oldValue: T, newValue: T) {
    this.observers.forEach((o) => o.apply(this, [propertyName, oldValue, newValue]));
  }
}


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


export type CodeScannerControllerOptions = {
  sleep: number;
  interval: number;
  autoPlay: boolean;
  facingMode: ConstrainDOMString;
};

export const defaultId = 'code-scanner';
export const defaultOptions: CodeScannerControllerOptions = {
  sleep: 5000,
  interval: 500,
  autoPlay: true,
  facingMode: 'environment',
};
