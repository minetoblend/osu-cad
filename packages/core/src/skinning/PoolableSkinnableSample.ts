import type { SampleChannel } from "@osucad/framework";
import { Axes, Bindable, Container, DrawableSample, LoadState } from "@osucad/framework";
import { SkinReloadableDrawable } from "./SkinReloadableDrawable";
import type { ISkinSource } from "./ISkinSource";
import type { ISampleInfo } from "../audio/ISampleInfo";

export class PoolableSkinnableSample extends SkinReloadableDrawable
{
  #sample: DrawableSample | null = null;
  #sampleInfo: ISampleInfo | null = null;
  #activeChannel: SampleChannel | null = null;

  public get sample()
  {
    return this.#sample;
  }

  readonly #sampleContainer: Container<DrawableSample>;

  readonly volume = new Bindable(1);

  readonly rate = new Bindable(1);

  constructor(sampleInfo?: ISampleInfo)
  {
    super();

    this.internalChild = this.#sampleContainer = new Container({
      relativeSizeAxes: Axes.Both,
    });

    if (sampleInfo)
      this.apply(sampleInfo);
  }

  apply(sampleInfo: ISampleInfo)
  {
    console.assert(this.#sampleInfo === null);
    this.#sampleInfo = sampleInfo;

    this.volume.value = sampleInfo.volume / 100.0;

    if (this.loadState >= LoadState.Ready)
      this.#updateSample();
  }

  protected override skinChanged(skin: ISkinSource)
  {
    super.skinChanged(skin);

    this.#updateSample();
  }

  #wasPlaying = false;

  #clearPreviousSamples()
  {
    if (this.#sampleContainer.children.length === 0)
      return;

    this.#wasPlaying = this.playing;

    this.#sampleContainer.clear();
    this.#sample = null;
  }

  #updateSample()
  {
    this.#clearPreviousSamples();

    if (this.#sampleInfo === null)
      return;

    const sample = this.currentSkin.getSample(this.#sampleInfo);

    if (sample === null)
      return;

    this.#sampleContainer.add(this.#sample = new DrawableSample(sample));

    this.#sample.volume.bindTo(this.volume);
    this.#sample.rate.bindTo(this.rate);

    if (this.#wasPlaying && this.looping)
      this.play();
  }

  play()
  {
    this.flushPendingSkinChanges();

    if (this.#sample === null)
      return;

    this.#activeChannel = this.#sample.getChannel();
    this.#activeChannel.looping = this.looping;
    this.#activeChannel.play();

    this.#played = true;
  }

  stop()
  {
    this.#activeChannel?.stop();
    this.#activeChannel = null;
  }

  get playing()
  {
    return this.#activeChannel?.playing ?? false;
  }

  #played = false;

  get played()
  {
    return this.#played;
  }

  #looping = false;

  get looping()
  {
    return this.#looping;
  }

  set looping(value)
  {
    this.#looping = value;

    if (this.#activeChannel !== null)
      this.#activeChannel.looping = value;
  }
}
