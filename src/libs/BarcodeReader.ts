import { readBarcodesFromImageData, ZXingReadResult, ZXingReadOptions } from '@sec-ant/zxing-wasm/reader';

enum VideoState {
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Null = "null"
}

interface BarcodeReaderOptions {
  facingMode?: 'user' | 'environment';
  decodeInterval?: number; // milliseconds
  autoPauseTime?: number; // milliseconds
}

class BarcodeReader {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private currentState: VideoState;
  private stream: MediaStream | null;
  private zoomValue: number;
  private torchValue: boolean;
  private decodeInterval: number;
  private autoPauseTime: number;
  private decodeTimeout: NodeJS.Timeout | null;

  constructor(private containerId: string, private options: BarcodeReaderOptions = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }

    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.currentState = VideoState.Null;
    this.stream = null;
    this.zoomValue = 1;
    this.torchValue = false;
    this.decodeInterval = options.decodeInterval || 100; // default 100ms
    this.autoPauseTime = options.autoPauseTime || 0; // default 0ms (no auto pause)
    this.decodeTimeout = null;

    container.appendChild(this.video);
    container.appendChild(this.canvas);

    this.setupVideoStream().catch(error => {
      console.error("Error setting up video stream:", error);
      throw new Error("Failed to set up video stream");
    });
  }

  private async setupVideoStream() {
    try {
      const constraints: MediaStreamConstraints = { video: {} };
      if (this.options.facingMode) {
        constraints.video = { facingMode: this.options.facingMode };
      }
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!this.stream) {
        throw new Error("Failed to get user media stream");
      }
      this.video.srcObject = this.stream;
      this.video.addEventListener('loadedmetadata', () => {
        this.currentState = VideoState.Playing;
        if (this.autoPauseTime > 0) {
          setTimeout(() => this.pause(), this.autoPauseTime);
        }
        requestAnimationFrame(() => this.decodeFrame());
      });
    } catch (error) {
      console.error("Error accessing video stream:", error);
      throw new Error("Failed to access video stream");
    }
  }

  private get videoState(): VideoState {
    return this.currentState;
  }

  private set videoState(newState: VideoState) {
    if (newState === VideoState.Playing && this.currentState !== VideoState.Playing) {
      this.video.play().catch(error => {
        console.error("Error playing video:", error);
        throw new Error("Failed to play video");
      });
      this.currentState = VideoState.Playing;
      requestAnimationFrame(() => this.decodeFrame());
    } else if (newState === VideoState.Paused && this.currentState === VideoState.Playing) {
      this.video.pause();
      this.currentState = VideoState.Paused;
    } else if (newState === VideoState.Stopped && this.currentState !== VideoState.Stopped) {
      this.video.pause();
      this.video.srcObject = null;
      this.stream?.getTracks().forEach(track => track.stop());
      this.currentState = VideoState.Stopped;
      this.stream = null;
    }
  }

  private getVideoTracks() {
    return this.stream?.getVideoTracks();
  }

  private async decodeFrame() {
    if (this.currentState === VideoState.Playing) {
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

      try {
        const results: ZXingReadResult[] = await readBarcodesFromImageData(imageData, { tryHarder: true } as ZXingReadOptions);
        if (results.length > 0) {
          const event = new CustomEvent('barcodeDetected', { detail: results[0] });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error("Error decoding barcode:", error);
        throw new Error("Failed to decode barcode");
      }

      this.decodeTimeout = setTimeout(() => {
        requestAnimationFrame(() => this.decodeFrame());
      }, this.decodeInterval);
    }
  }

  public get zoom(): number {
    return this.zoomValue;
  }

  public set zoom(value: number) {
    this.zoomValue = value;
    const track = this.getVideoTracks()?.[0];
    if (track?.getCapabilities().zoom) {
      track.applyConstraints({ advanced: [{ zoom: value }] });
    } else {
      throw new Error("Zoom is not supported on the video track");
    }
  }

  public get torch(): boolean {
    return this.torchValue;
  }

  public set torch(value: boolean) {
    this.torchValue = value;
    const track = this.getVideoTracks()?.[0];
    if (track?.getCapabilities().torch) {
      track.applyConstraints({ advanced: [{ torch: this.torchValue }] });
    } else {
      throw new Error("Torch is not supported on the video track");
    }
  }

  public stop() {
    if (this.decodeTimeout) {
      clearTimeout(this.decodeTimeout);
      this.decodeTimeout = null;
    }
    super.stop();
  }
}

export default BarcodeReader;

