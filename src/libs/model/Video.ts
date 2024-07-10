import { FacingModeOrDeviceId, VideoStreamConstraints } from "../value/VideoStreamConstraints";

export class Scanner {
  private readonly _video: VideoManager;
  private readonly _containerElement : HTMLElement;
  private readonly _videoElement: HTMLVideoElement;
  private readonly _canvasElement: HTMLCanvasElement;
  
  constructor(elementId: string) {
    const containerElement = document.getElementById(elementId);
    if(containerElement === null) throw new Error("Element not found" + elementId);
    this._containerElement = containerElement;
    
    this._videoElement = document.createElement('video');
    this._containerElement.appendChild(this._videoElement);
    this._canvasElement = document.createElement('canvas');
    this._containerElement.appendChild(this._canvasElement);
    this.resizeElements();
  }

  public async start(videoOptions:{}) {
    const mediaDevices = navigator.mediaDevices;
    const video = await VideoStreamManager.open(mediaDevices, 'user');
    this._video = video;
  }

  private resizeElements(){
    this._videoElement.height = this._containerElement.clientHeight;
    this._videoElement.width = this._containerElement.clientWidth;
    this._canvasElement.height = this._containerElement.clientHeight;
    this._canvasElement.width = this._containerElement.clientWidth;
  }

}

export class Video {
  private readonly _element: HTMLVideoElement;
  private readonly _stream: MediaStream;
  private readonly _service: VideoFeatureManager;

  private constructor(videoElement: HTMLVideoElement, stream: MediaStream) {
    this._element = videoElement;
    this._stream = stream;
    this._service = new VideoFeatureManager(stream);
    this._element.srcObject = this._service.stream;
  }
  public static async initialize(videoElement: HTMLVideoElement, mediaDevices:MediaDevices, facingModeOrDeviceId: FacingModeOrDeviceId) {
    const constraints = new VideoStreamConstraints(facingModeOrDeviceId).value;
    const stream = await mediaDevices.getUserMedia(constraints);
    return new Video(videoElement, stream);
  }
}

export class VideoStreamManager {
  private readonly _stream: MediaStream;
  
  private constructor(stream: MediaStream) {
    this._stream = stream;
  }

  public static async open(mediaDevices:MediaDevices, facingModeOrDeviceId: FacingModeOrDeviceId) {
    const constraints = new VideoStreamConstraints(facingModeOrDeviceId).value;
    const stream = await mediaDevices.getUserMedia(constraints);
    return new VideoStreamManager(stream);
  }

  get stream() {
    return this._stream;
  }
}


export class VideoFeatureManager {
  private readonly _stream: MediaStream;
  private readonly _tracks: MediaStreamTrack[];
  private readonly _track: MediaStreamTrack;
  private readonly _capabilities: MediaTrackCapabilities[];
  private readonly _capabilitie: MediaTrackCapabilities;
  private readonly _constraints: MediaTrackConstraints[];
  private readonly _constraint: MediaTrackConstraints;
  private readonly _settings: MediaTrackSettings[];
  private readonly _setting: MediaTrackSettings;
  
  constructor(stream: MediaStream) {
    this._stream = stream;
    this._tracks = this._stream.getVideoTracks();
    this._track = this._tracks[0];
    this._capabilities = this._tracks.map(track => track.getCapabilities());
    this._capabilitie = this._capabilities[0];
    this._constraints = this._tracks.map(track => track.getConstraints());
    this._constraint = this._constraints[0];
    this._settings = this._tracks.map(track => track.getSettings());
    this._setting = this._settings[0];
  }

  get stream() {
    return this._stream;
  }
  get tracks() {
    return this._tracks;
  }
  get track() {
    return this._track;
  }
  get capabilities() {
    return this._capabilities;
  }
  get capabilitie() {
    return this._capabilitie;
  }
  get constraints() {
    return this._constraints;
  }
  get constraint() {
    return this._constraint;
  }
  get settings() {
    return this._settings;
  }
  get setting() {
    return this._setting;
  }
}