import { FacingMode } from "./FacingMode";

export class VideoStreamConstraints {
  private readonly _value: MediaStreamConstraints;
  constructor(facingModeOrDeviceId: FacingMode | string) {
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