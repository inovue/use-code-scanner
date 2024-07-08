export type ZoomCapabilities = Exclude<MediaTrackCapabilities['zoom'], undefined>;

export class ZoomValue {
  static readonly DEFAULT_VALUE = 1;
  private readonly _value: number;

  constructor(zoomCapabilities:ZoomCapabilities, value: number=ZoomValue.DEFAULT_VALUE) {
    const { min, max } = zoomCapabilities;
    if (value < min) {
      this._value = min;
    }else if (value > max) {
      this._value = max;
    }else{
      this._value = value;
    }
  }
  get value() {
    return this._value;
  }
}