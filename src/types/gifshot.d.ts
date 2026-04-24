declare module 'gifshot' {
  interface Options {
    video?: string[];
    numFrames?: number;
    interval?: number;
    offset?: number;
    gifWidth?: number;
    gifHeight?: number;
    sampleInterval?: number;
    progressCallback?: (progress: number) => void;
  }

  interface Result {
    error: boolean;
    errorCode?: string | number;
    errorMsg?: string;
    image: string;
  }

  export function createGIF(options: Options, callback: (result: Result) => void): void;
}
