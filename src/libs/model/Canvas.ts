export class Canvas {
  private readonly _element: HTMLCanvasElement;
  
  constructor(canvasElement: HTMLCanvasElement) {
    this._element = canvasElement;
  }

  public getImageDataFromVideo(videoElement: HTMLVideoElement) {
    const {width: canvasWidth, height: canvasHeight} = this._element;
    const canvasConstext = this._element.getContext('2d');
    if(canvasConstext === null) throw new Error("Failed to get 2d context from canvas element");
    
    canvasConstext.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight);
    const imageData = canvasConstext.getImageData(0, 0, canvasWidth, canvasHeight);
    return imageData;
  }
}