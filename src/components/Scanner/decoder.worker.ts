import { scan } from 'qr-scanner-wechat'

self.addEventListener('message', (event:MessageEvent<HTMLCanvasElement>) => {
  const canvas = event.data;
  scan(canvas).then((result) => {
    console.log(result);
    self.postMessage(result.text);
  });
});

export default {}