import type { IFramedAnimation } from "./IFramedAnimation";
import { Cached } from "../../caching";
import { FrameData } from "../../timing/FrameData";
import { clamp } from "../../utils";
import { AnimationClockComposite } from "./AnimationClockComposite";

export abstract class Animation<T> extends AnimationClockComposite implements IFramedAnimation 
{
  defaultFrameLength = 1000 / 60;

  readonly #frameData: FrameData<T>[];

  get frameCount() 
  {
    return this.#frameData.length;
  }

  #currentFrameIndex = 0;

  get currentFrameIndex() 
  {
    return this.#currentFrameIndex;
  }

  get currentFrame() 
  {
    return this.#frameData[this.currentFrameIndex].content;
  }

  readonly #currentFrameCache = new Cached();

  protected constructor(startAtCurrentTime: boolean = true) 
  {
    super(startAtCurrentTime);
    this.#frameData = [];
    this.loop = true;
  }

  gotoFrame(frameIndex: number) 
  {
    this.seek(this.#frameData[clamp(frameIndex, 0, this.#frameData.length)].displayStartTime);
  }

  addFrame(content: T, displayDuration?: number): void;
  addFrame(frame: FrameData<T>): void;
  addFrame(frame: T | FrameData<T>, displayDuration?: number) 
  {
    if (!(frame instanceof FrameData)) 
    {
      frame = new FrameData<T>(frame, displayDuration ?? this.defaultFrameLength);
    }

    const lastFrame = this.#frameData[this.#frameData.length - 1];

    frame.displayStartTime = lastFrame?.displayEndTime ?? 0;
    this.duration += frame.duration;

    this.#frameData.push(frame);

    this.onFrameAdded(frame.content, frame.duration);

    if (this.#frameData.length === 1) 
    {
      this.#currentFrameCache.invalidate();
    }
  }

  addFrames(...frames: T[] | FrameData<T>[]): void 
  {
    for (const frame of frames) 
    {
      if (frame instanceof FrameData) 
      {
        this.addFrame(frame.content, frame.duration);
      }
      else 
      {
        this.addFrame(frame);
      }
    }
  }

  clearFrames() 
  {
    this.#frameData.length = 0;
    this.duration = 0;
    this.#currentFrameIndex = 0;

    this.clearDisplay();
  }

  protected abstract displayFrame(content: T): void;

  protected abstract clearDisplay(): void;

  protected onFrameAdded(content: T, duration: number) 
  {}

  override update() 
  {
    super.update();

    if (this.#frameData.length === 0) 
    {
      return;
    }

    this.#updateFrameIndex();

    if (!this.#currentFrameCache.isValid) 
    {
      this.#updateCurrentFrame();
    }
  }

  #updateFrameIndex() 
  {
    const diff = this.playbackPosition - this.#frameData[this.currentFrameIndex].displayStartTime;

    if (diff < 0) 
    {
      while (
        this.currentFrameIndex > 0
        && this.playbackPosition < this.#frameData[this.currentFrameIndex].displayStartTime
      ) 
      {
        this.#currentFrameIndex--;
        this.#currentFrameCache.invalidate();
      }
    }
    else if (diff > 0) 
    {
      while (
        this.currentFrameIndex < this.#frameData.length - 1
        && this.playbackPosition >= this.#frameData[this.currentFrameIndex].displayEndTime
      ) 
      {
        this.#currentFrameIndex++;
        this.#currentFrameCache.invalidate();
      }
    }
  }

  #updateCurrentFrame() 
  {
    this.displayFrame(this.currentFrame);

    this.updateSizing();

    this.#currentFrameCache.validate();
  }
}
