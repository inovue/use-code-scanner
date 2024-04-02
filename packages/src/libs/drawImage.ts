export function drawImage(video: HTMLVideoElement): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    // Canvasを作成
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Failed to get 2d context from canvas'));
      return;
    }

    // Canvasのサイズを設定
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Videoから画像を描画
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // CanvasからImageDataを作成
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    } catch (error) {
      reject(new Error('Failed to create ImageData from canvas'));
    }
  });
}
