import BarcodeReader from './BarcodeReader';

// Mocks for navigator.mediaDevices and HTML elements
beforeEach(() => {
  jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'video') {
      return {
        play: jest.fn(),
        pause: jest.fn(),
        srcObject: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    } else if (tagName === 'canvas') {
      return {
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
          getImageData: jest.fn().mockReturnValue(new ImageData(200, 200)),
        }),
      };
    }
  });
  global.navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue({
      getVideoTracks: jest.fn().mockReturnValue([{
        getCapabilities: jest.fn().mockReturnValue({}),
        getConstraints: jest.fn().mockReturnValue({}),
        applyConstraints: jest.fn(),
      }]),
    }),
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('BarcodeReader', () => {
  test('constructor initializes correctly', () => {
    const reader = new BarcodeReader('test-container');
    expect(reader).toBeDefined();
  });

  test('stream setter and getter work correctly', async () => {
    const reader = new BarcodeReader('test-container');
    reader.stream = 'environment';
    expect(reader.stream).toBeDefined();
  });

  test('status reflects video playback state', () => {
    const reader = new BarcodeReader('test-container');
    expect(reader.status).toBe('null');
    reader.status = 'playing';
    expect(reader.status).toBe('playing');
  });

  test('decode method processes video frames', async () => {
    const reader = new BarcodeReader('test-container');
    document.addEventListener('barcodeDetected', (event) => {
      expect(event).toBeDefined();
    });
    await reader.decode();
  });

  test('zoom getter and setter work correctly', () => {
    const reader = new BarcodeReader('test-container');
    expect(() => { reader.zoom = 2; }).not.toThrow();
  });

  test('torch getter and setter work correctly', () => {
    const reader = new BarcodeReader('test-container');
    expect(() => { reader.torch = true; }).not.toThrow();
  });
});