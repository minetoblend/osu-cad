import type { ScheduledDelegate, ValueChangedEvent } from "@osucad/framework";
import { Bindable, dependencyLoader, injectionToken } from "@osucad/framework";
import { SkinnableSound } from "./SkinnableSound";

export interface ISamplePlaybackDisabler
{
  readonly samplePlaybackDisabled: Bindable<boolean>
}

export const ISamplePlaybackDisabler = injectionToken<ISamplePlaybackDisabler>("ISamplePlaybackDisabler");


export class PausableSkinnableSound extends SkinnableSound
{
  #requestedPlaying = false;

  public get requestedPlaying()
  {
    return this.#requestedPlaying;
  }

  readonly #samplePlaybackDisabled = new Bindable(false);

  #scheduledStart?: ScheduledDelegate;

  @dependencyLoader()
  #load()
  {
    const samplePlaybackDisabler = this.dependencies.resolveOptional(ISamplePlaybackDisabler);

    if(samplePlaybackDisabler)
    {
      this.#samplePlaybackDisabled.bindTo(samplePlaybackDisabler.samplePlaybackDisabled);
      this.#samplePlaybackDisabled.bindValueChanged(this.#samplePlaybackDisabledChanged, this);
    }
  }

  #samplePlaybackDisabledChanged(disabled: ValueChangedEvent<boolean>)
  {
    if (!this.requestedPlaying)
      return;

    if (!this.looping)
      return;

    this.#cancelPendingStart();

    if (disabled.value)
      super.stop();
    else
    {
      this.#scheduledStart = this.schedule(() =>
      {
        if (this.requestedPlaying)
          super.play();
      });
    }
  }

  public override play(): void
  {
    this.#cancelPendingStart();
    this.#requestedPlaying = true;

    if (this.#samplePlaybackDisabled.value)
      return;

    super.play();
  }

  public override stop(): void
  {
    this.#cancelPendingStart();
    this.#requestedPlaying = false;
    super.stop();
  }

  #cancelPendingStart()
  {
    this.#scheduledStart?.cancel();
    this.#scheduledStart = undefined;
  }
}

