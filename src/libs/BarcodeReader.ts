import { readBarcodesFromImageData, type ReaderOptions } from 'zxing-wasm/reader';
import { FacingMode, FacingModeType } from './value';

const defaultReaderOptions: ReaderOptions = {
  tryHarder: true,
  formats: ["QRCode"],
  // maxNumberOfSymbols: 1,
};

enum VideoStatusRequestType {
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Null = "null"
}
type VideoStatus = {
  playing: boolean;
  paused: boolean;
  stopped: boolean;
}


interface BarcodeReaderOptions {
  facingMode: FacingMode;
  decodeInterval: number; // milliseconds
  autoPauseTime: number; // milliseconds
}
const defaultBarcodeReaderOptions: BarcodeReaderOptions = {
  facingMode: new FacingMode(FacingModeType.Environment),
  decodeInterval: 100,
  autoPauseTime: 0
};

class BarcodeReader {
  private container: HTMLElement;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private decodeTimeout: number | null;
  private options: BarcodeReaderOptions;

  constructor(
    private containerId: string,
    _options?: BarcodeReaderOptions
  ) {
    this.options = { ...defaultBarcodeReaderOptions, ..._options };
    const container = document.getElementById(this.containerId);
    if(container === null){
      throw new Error(`Container element with id '${this.containerId}' not found`);
    }
    this.container = container;
    this.video = document.createElement('video');;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.decodeTimeout = null;

    this.container.appendChild(this.video);
    this.container.appendChild(this.canvas);

    const { facingMode } = this.options;
    this.stream = facingMode
  }

  private get stream(): MediaStream | null {
    return this.video?.srcObject as MediaStream | null;
  }

  private set stream(facingModeOrDeviceId: FacingMode | string | null) {
    if (facingModeOrDeviceId === null) {
      this.video.srcObject = null;
    } else {
      const constraintsBase = {
        video: facingModeOrDeviceId instanceof FacingMode ?
          { facingMode: facingModeOrDeviceId.value } :
          { deviceId: facingModeOrDeviceId },
        audio: false
      }
      navigator.mediaDevices.getUserMedia(constraintsBase).then((stream) => {
        this.video.srcObject = stream;
        
      }).catch((error) => {
        console.error("Error accessing video stream:", error);
        throw new Error("Failed to access video stream");
      });
    }
  }

  
  public get status(): VideoStatus|null {
    if(!this.video){
      return null;
    }else{
      return {
        playing: !this.video.paused && !this.video.ended,
        paused: this.video.paused,
        stopped: this.video.ended 
      }
    }
  }

  private async play() {
    await this.video.play();
  }
  private pause() {
    this.video.pause();
  }
  private stop() {
    this.video.pause();
    this.stream = null;
  }
  private null() {
    this.stream = null;
  }

  public set status(requestType: VideoStatusRequestType) {
    const videoStatusMethods = {
      [VideoStatusRequestType.Playing]: async () => await this.play(),
      [VideoStatusRequestType.Paused]: () => this.pause(),
      [VideoStatusRequestType.Stopped]: () => this.stop(),
      [VideoStatusRequestType.Null]: () => this.null(),
    }
    videoStatusMethods[requestType]();
  }

  private get tracks() {
    return this.stream?.getVideoTracks() ?? null;
  }
  private get track() {
    return this.tracks?.[0] ?? null;
  }

  private get capabilities() {
    return this.tracks?.map(track => track.getCapabilities()) ?? null;
  }
  private get capabilitie() {
    return this.capabilities?.[0] ?? null;
  }

  private get constraints() {
    return this.tracks?.map(track => track.getConstraints()) ?? null;
  }
  private get constraint() {
    return this.constraints?.[0] ?? null;
  }

  private async decode(options: ReaderOptions = defaultReaderOptions) {
    this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    try {
      const results = await readBarcodesFromImageData(imageData, options);
      if (results.length > 0) {
        const event = new CustomEvent('barcodeDetected', { detail: results[0] });
        document.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error decoding barcode:", error);
      throw new Error("Failed to decode barcode");
    }
  }

  public get zoom(): number {
    return this.constraint?.zoom || 1;
  }

  public set zoom(value: number) {
    if (this.capabilitie?.zoom) {
      this.track?.applyConstraints({ advanced: [{ zoom: value }] });
    } else {
      throw new Error("Zoom is not supported on the track");
    }
  }

  public get torch(): boolean | null {
    if (this.capabilitie?.torch) {
      return this.constraint?.torch || false;
    } else {
      return null
    }
  }

  public set torch(value: boolean) {
    if (this.capabilitie?.torch) {
      this.track?.applyConstraints({ advanced: [{ torch: value }] });
    } else {
      throw new Error("Torch is not supported on the track");
    }
  }
}

export default BarcodeReader;

