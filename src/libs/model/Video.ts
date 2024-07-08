import { TorchCapabilities, ZoomCapabilities } from "../value";
import { FacingMode } from "../value/FacingMode";
import { VideoStreamConstraints } from "../value/VideoStreamConstraints";

export class Video {
  private readonly _videoElement: HTMLVideoElement;
  
  constructor(videoElement: HTMLVideoElement, facingModeOrDeviceId: FacingMode | string) {
    this._videoElement = videoElement;
    
    const meidaStreamConstraints = new VideoStreamConstraints(facingModeOrDeviceId).value;
    navigator.mediaDevices.getUserMedia(meidaStreamConstraints).then(stream => {
      this._videoElement.srcObject = stream;
    }).catch(error => {
      console.error("Error accessing video stream:", error);
      throw new Error("Failed to access video stream");
    });
  }

  private get stream():MediaStream | null {
    return this._videoElement.srcObject as MediaStream | null;
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


  public get zoom():{value: number | null, capabilities: ZoomCapabilities | null} {
    return {
      value: this.constraint?.zoom ?? null,
      capabilities: this.capabilitie?.zoom ?? null
    }
  }
  public set zoom(value: number) {
    if (this.capabilitie?.zoom) {
      this.track?.applyConstraints({ advanced: [{ zoom: value }] });
    } else {
      throw new Error("Zoom is not supported on the track");
    }
  }

  public get torch():{value: number | null, capabilities: TorchCapabilities | null} {
    return {
      value: this.constraint?.zoom ?? null,
      capabilities: this.capabilitie?.torch ?? null
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