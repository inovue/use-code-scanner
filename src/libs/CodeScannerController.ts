import { scanImageData } from '@undecaf/zbar-wasm';
import { ZBarSymbolType } from '@undecaf/zbar-wasm';

type Observer = (<T>(a: string, b: T, c: T) => void);

export class CodeScannerController {
  private _devices: MediaDeviceInfo[] = [];
  private _formats: ZBarSymbolType[] = [];
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

    this.formats = options.formats;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this._devices = devices.filter(device => device.kind === 'videoinput');
    }).catch((err) => {
      console.error('Error getting devices', err);
    });

    navigator.mediaDevices.getUserMedia({video:{facingMode:options.facingMode},audio:false}).then((stream) => {
      if(this._video) this._video.srcObject = stream;
      if(options.autoPlay) this.play = true;
    });
  }

  get devices(){
    return this._devices;
  }

  get formats(){
    return this._formats;
  }

  set formats(value:ZBarSymbolType[]){
    this._formats = [...new Set([...this._formats, ...value])];
    this.notifyObserver("formats", this.formats, this.formats);
  }

  get facingMode(){
    return this.constraints?.facingMode;
  }

  set facingMode(value:ConstrainDOMString|undefined){
    if(this.facingMode === value) return;
    this.notifyObserver("facingMode", this.facingMode, value);

    this.play = false;
    navigator.mediaDevices.getUserMedia({video:{facingMode:value},audio:false}).then((stream) => {
      if(this._video) this._video.srcObject = stream;
      this.play = true;
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

  get zoom():{min?:number, max?:number, step?:number, value?:number}|null{
    const capability = this.capabilities?.zoom;
    if(!capability) return null;
    const value = {
      max: capability.max,
      min: capability.min,
      step: capability.step,
      value: this.constraints?.advanced?.[0].zoom || capability.min
    }
    return value;
  }
  set zoom(value:number) {
    if (this.zoom?.value === value) return;
    this.notifyObserver("zoom", this.zoom?.value, value);

    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{torch: this.torch, zoom:value }]})
  }

  get torch():boolean|null{
    const capability = this.capabilities?.torch;
    if(!capability) return null;

    return this.constraints?.advanced?.[0].torch || false;
  }

  set torch(value:boolean){
    if (this.torch === null || this.torch === value) return;
    this.notifyObserver("torch", this.torch, value);

    // @ts-expect-error - advanced is not in the MediaTrackConstraints type
    this.track && this.track.applyConstraints({advanced:[{torch:value, zoom: this.zoom?.value}]})
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
    const imageData = this.drawImage(this._video);
    const symbols = await scanImageData(imageData);
    const results = symbols.filter(symbol=>this.formats.includes(symbol.type)).map(symbol => symbol.decode());
    console.timeEnd("decode");
    console.log('results', results);
    return results;
  }

  private drawImage(video: HTMLVideoElement): ImageData {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2d context from canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      return imageData;
    } catch (error) {
      throw new Error('Failed to create ImageData from canvas');
    }
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
  zoom?:number;
}

export interface MediaTrackAdvancedConstraints extends MediaTrackConstraints {
  advanced?: MediaTrackAdvancedConstraintSet[];
}


export type CodeScannerControllerOptions = {
  sleep: number;
  interval: number;
  autoPlay: boolean;
  facingMode: ConstrainDOMString;
  formats: ZBarSymbolType[];
};

export const defaultId = 'code-scanner';
export const defaultOptions: CodeScannerControllerOptions = {
  sleep: 5000,
  interval: 500,
  autoPlay: true,
  facingMode: 'environment',
  formats: [ZBarSymbolType.ZBAR_QRCODE]
};
