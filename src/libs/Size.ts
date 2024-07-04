export class Size {
  constructor(public width: number, public height: number) {}

  contain(newWidthOrAspectRatio: number, newHeightParam?: number): Size {
    let aspectRatio = newWidthOrAspectRatio;
    let newWidth = this.width;
    let newHeight = this.height;
    if (newHeightParam === undefined) {
      aspectRatio = newWidthOrAspectRatio;
      if (this.width / this.height > aspectRatio) {
        newWidth = Math.floor(this.height * aspectRatio);
      } else {
        newHeight = Math.floor(this.width / aspectRatio);
      }
    } else {
      newWidth = newWidthOrAspectRatio;
      newHeight = newHeightParam;
    }
    return new Size(newWidth, newHeight);
  }
}
