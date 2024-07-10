import { Video, VideoStreamManager } from "./Video";

export type TorchValue = boolean | null;
export type TorchConstraints = Exclude<MediaTrackConstraints['torch'], undefined> | null;
export type TorchCapabilities = Exclude<MediaTrackCapabilities['torch'], undefined> | null;

export class Torch {
  private readonly _tracks: MediaStreamTrack;
  private readonly _capabilities: TorchCapabilities;
  private readonly _constraints: TorchCapabilities;

  constructor(video:VideoStreamManager) {
    this._tracks = video.tracks?.[0];
    this._capabilities = video.capabilities?.[0].torch ?? null;
  }

  get value() {
    return this._value;
  }
  get capabilities() {
    return this._capabilities;
  }

  public set(value: boolean) {
    if (this._capabilities?.[0].torch === undefined) throw new Error("Torch is not supported");
    if (this._tracks?.[0] === undefined) throw new Error("Track is not supported");
    this._tracks[0].applyConstraints({advanced:[{torch:value}]});
  }
}