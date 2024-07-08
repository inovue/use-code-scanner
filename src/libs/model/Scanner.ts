import { Canvas } from "./Canvas";
import { Video } from "./Video";

export class Scanner {
  private readonly _video: Video;
  private readonly _canvas: Canvas;

  constructor(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement, facingModeOrDeviceId: string) {
    this._video = new Video(videoElement, facingModeOrDeviceId);
    this._canvas = new Canvas(canvasElement, videoElement);
  }

  
  
}