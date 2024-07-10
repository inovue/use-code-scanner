import { FacingMode } from "./FacingMode";

export type FacingModeOrDeviceId = FacingMode | string;

export class VideoStreamConstraints {
  private readonly _value: MediaStreamConstraints;
  constructor(facingModeOrDeviceId: FacingModeOrDeviceId) {
    if(facingModeOrDeviceId instanceof FacingMode){
      this._value = { 
        video: { facingMode: facingModeOrDeviceId.value },
        audio: false 
      };
    }else{
      this._value = { 
        video: { deviceId: facingModeOrDeviceId },
        audio: false 
      };
    }
  }
  get value() {
    return this._value;
  }
}