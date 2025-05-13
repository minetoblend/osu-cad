import { GameHost } from "./GameHost";
import { Vec2 } from "../math/Vec2";
import type { Game } from "../Game";
import { FramedClock } from "../timing/FramedClock";
import type { IClock } from "../timing/IClock";
import type { IFrameBasedClock } from "../timing/IFrameBasedClock";
import streamSaver from "streamsaver";
import EncoderWorker from "./EncoderWorker?worker";

export interface RecordingInfo
{
  width: number
  height: number
  framerate: number
  readyForRecording?: () => boolean

  duration: number
}

export class RecorderGameHost extends GameHost
{
  constructor()
  {
    super("ManualGameHost");
  }

  resolution!: Vec2;

  override getWindowSize(): Vec2
  {
    return this.resolution;
  }

  async record(game: Game, options: RecordingInfo)
  {
    let { width, height } = options;

    width = Math.round(width);
    height = Math.round(height);

    console.assert(options.framerate > 0, "frameRate must be positive");
    console.assert(width > 0, "width must be positive");
    console.assert(height > 0, "height must be positive");

    this.resolution = new Vec2(width, height);

    await this.init(game);

    const clock = this.recorderClock;

    if (options.readyForRecording)
    {
      while (!options.readyForRecording())
      {
        this.update();
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    }

    const canvas = this.renderer.canvas;

    document.body.appendChild(canvas);

    canvas.style.maxHeight = "100vh";
    canvas.style.maxWidth = "100vw";
    canvas.style.objectFit = "contain";

    const worker = new EncoderWorker();

    const readableStream = new ReadableStream<VideoFrame | null>({
      pull: async (controller) =>
      {
        if (clock.currentTime > options.duration)
        {
          controller.enqueue(null);
          controller.close();
          return;
        }

        this.update();
        this.render();

        const bitmap = await createImageBitmap(canvas);

        const videoFrame = new VideoFrame(bitmap, {
          timestamp: clock.currentTime * 1000,
          duration: 1e6 / options.framerate,
        });

        controller.enqueue(videoFrame);

        clock.currentTime += 1000 / options.framerate;
      },
    });

    const writableStream = streamSaver.createWriteStream("replay.mp4");

    worker.postMessage({
      type: "start",
      inputStream: readableStream,
      outputStream: writableStream,
      width,
      height,
      framerate: options.framerate,
    }, [readableStream, writableStream]);
  }

  readonly recorderClock = {
    currentTime: 0,
    rate: 1,
    isRunning: true,
  } satisfies IClock;

  protected override createClock(): IFrameBasedClock
  {
    return new class extends FramedClock
    {
      constructor(clock: IClock)
      {
        super(clock);
      }

      override processFrame()
      {
        super.processFrame();
        console.trace();
      }
    }(this.recorderClock);
  }
}
