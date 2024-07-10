export type ZoomValue = number | null;
export type ZoomCapabilities = Exclude<MediaTrackCapabilities['zoom'], undefined> | null;

export class Zoom {
  private readonly _value: ZoomValue;
  private readonly _capabilities: ZoomCapabilities;

  constructor(capabilities:MediaTrackCapabilities|null, constraints:MediaTrackConstraints|null) {
    this._capabilities = capabilities?.zoom ?? null;
    this._value = constraints?.zoom ?? null;
  }
  
  get value() {
    return this._value;
  }
  get capabilities() {
    return this._capabilities;
  }
}