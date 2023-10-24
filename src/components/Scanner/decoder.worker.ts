import { scan } from 'qr-scanner-wechat'

self.addEventListener('message', (event:MessageEvent<ImageData>) => {
  const eventData = event.data;
  console.log("get message", eventData);

  scan(eventData).then((result) => {
    console.log("scaned", result);
    self.postMessage(eventData);
  });
});

export default {}