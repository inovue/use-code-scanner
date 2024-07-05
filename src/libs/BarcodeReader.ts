import { readBarcodesFromImageData, type ReaderOptions } from 'zxing-wasm/reader';


const defaultReaderOptions: ReaderOptions = {
  tryHarder: true,
  formats: ["QRCode"],
  // maxNumberOfSymbols: 1,
};

enum VideoStatus {
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Null = "null"
}
enum FacingMode {
  User = "user",
  Environment = "environment"
}

interface BarcodeReaderOptions {
  facingMode: 'user' | 'environment';
  decodeInterval: number; // milliseconds
  autoPauseTime: number; // milliseconds
}
const defaultBarcodeReaderOptions: BarcodeReaderOptions = {
  facingMode: 'environment',
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

  private set stream(facingModeOrDeviceId: string | null) {
    if (facingModeOrDeviceId === null) {
      this.video.srcObject = null;
    } else {
      const constraintsBase = {
        video: this.isFacingMode(facingModeOrDeviceId) ?
          { facingMode: facingModeOrDeviceId } :
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
  private isFacingMode(value: string) {
    return Object.values(FacingMode).includes(value as FacingMode);
  }

  public get status(): VideoStatus {
    if(!this.video){
      return VideoStatus.Null;
    } else if (this.video.paused) {
      return VideoStatus.Paused;
    } else if (this.video.ended) {
      return VideoStatus.Stopped;
    }
    return VideoStatus.Playing;
  }

  public set status(newState: VideoStatus) {
    switch (newState) {
      case VideoStatus.Playing:
        this.video.play();
        break;
      case VideoStatus.Paused:
        this.video.pause();
        break;
      case VideoStatus.Stopped:
        this.video.pause();
        this.stream = null;
        break;
      case VideoStatus.Null:
        this.stream = null;
        break;
    }
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
    return this.tracks?.map(tracks => tracks.getConstraints()) ?? null;
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

