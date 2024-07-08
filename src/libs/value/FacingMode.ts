export enum FacingModeType {
  User = "user",
  Environment = "environment"
}

export class FacingMode {
  private readonly _value: FacingModeType;

  constructor(value: FacingModeType) {
    this._value = value;
  }
  
  get value() {
    return this._value;
  }
}