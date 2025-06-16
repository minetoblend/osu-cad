import { SkinReloadableDrawable } from "./SkinReloadableDrawable";
import { PoolableSkinnableSample } from "./PoolableSkinnableSample";
import { Bindable, Container, LoadState } from "@osucad/framework";
import type { ISampleInfo } from "../audio/ISampleInfo";

export class SkinnableSound extends SkinReloadableDrawable
{
  public minimumSampleVolume = 0;

  override get removeWhenNotAlive(): boolean
  {
    return false;
  }

  override get removeCompletedTransforms(): boolean
  {
    return false;
  }

  override set removeCompletedTransforms(value: boolean)
  {
    // noop
  }

  protected get playWhenZeroVolume()
  {
    return this.looping;
  }

  get drawableSamples()
  {
    return this.#samplesContainer.children.map(it => it.sample).filter(it => it !== null);
  }

  readonly #samplesContainer: Container<PoolableSkinnableSample>;

  readonly rate = new Bindable(1);

  public constructor(samples?: ISampleInfo | ISampleInfo[])
  {
    super();

    this.internalChild = this.#samplesContainer = new Container();

    if (samples)
      this.#samples = Array.isArray(samples) ? samples : [samples];
  }

  #samples: readonly ISampleInfo[] = [];

  public get samples(): readonly ISampleInfo[]
  {
    return this.#samples;
  }

  public set samples(value: readonly ISampleInfo[])
  {
    if (this.#samples === value)
      return;

    this.#samples = value;

    if (this.loadState >= LoadState.Ready)
      this.#updateSamples();
  }

  clearSamples()
  {
    this.samples = [];
  }

  #looping: boolean = false;

  get looping(): boolean
  {
    return this.#looping;
  }

  set looping(value: boolean)
  {
    if (this.#looping === value)
      return;

    this.#looping = value;

    for (const s of this.#samplesContainer.children)
      s.looping = value;
  }

  play()
  {
    this.flushPendingSkinChanges();

    for (const c  of this.#samplesContainer.children)
    {
      if (this.playWhenZeroVolume || c.volume.value > 0)
      {
        c.stop();
        c.play();
      }
    }
  }

  protected override loadAsyncComplete()
  {
    if (this.#samplesContainer.children.length > 0)
      this.#updateSamples();

    super.loadAsyncComplete();
  }

  stop()
  {
    for (const c of this.#samplesContainer.children)
      c.stop();
  }

  #updateSamples()
  {
    const wasPlaying = this.isPlaying;

    if (wasPlaying && this.looping)
      this.stop();

    // Remove all pooled samples (return them to the pool), and dispose the rest.
    this.#samplesContainer.removeRange(this.#samplesContainer.children.filter(s => s.isInPool), false);
    this.#samplesContainer.clear();

    for (const s of this.#samples)
    {
      const sample = /* TODO: samplePool?.GetPooledSample(s) ?? */ new PoolableSkinnableSample(s);
      sample.looping = this.looping;
      sample.volume.value = Math.max(s.volume, this.minimumSampleVolume) / 100.0;

      sample.rate.bindTo(this.rate);

      this.#samplesContainer.add(sample);
    }

    if (wasPlaying && this.looping)
      this.play();
  }

  get isPlaying()
  {
    for (const c of this.#samplesContainer.children)
    {
      if (c.playing)
        return true;
    }

    return false;
  }
}
