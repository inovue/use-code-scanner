import { ScannerStatus } from "../Scanner";
export type ControllerProps = {
  status: ScannerStatus
  element: {
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
  }
}