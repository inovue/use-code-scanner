export type TorchCapabilities = Exclude<MediaTrackCapabilities['torch'], undefined>;

export class TorchValue {
  static readonly DEFAULT_VALUE = false;
  private readonly _value: boolean;
  private readonly _capabilities: TorchCapabilities;

  constructor(capabilities:TorchCapabilities, value: boolean=TorchValue.DEFAULT_VALUE) {
    this._value = value;
    this._capabilities = capabilities;
  }
  get value() {
    return this._value;
  }
  public toggle() {
    return new TorchValue(this._capabilities, !this._value);
  }
}