export class Canvas {
  private readonly _canvasElement: HTMLCanvasElement;
  private readonly _videoElement: HTMLVideoElement;
  private readonly _canvasContext: CanvasRenderingContext2D;

  constructor(canvasElement: HTMLCanvasElement, videoElement: HTMLVideoElement) {
    this._canvasElement = canvasElement;
    this._videoElement = videoElement;
    const canvasConstext = this._canvasElement.getContext('2d');
    if(canvasConstext === null){
      throw new Error('CanvasRenderingContext2D is null');
    }else{
      this._canvasContext = canvasConstext
    }
  }

  public getImageData(): ImageData {
    const {width: canvasWidth, height: canvasHeight} = this._canvasElement
    this._canvasContext.drawImage(this._videoElement, 0, 0, canvasWidth, canvasHeight);
    const imageData = this._canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
    return imageData;
  }
}