import { Bindable, resolved, TextureAnimation } from "@osucad/framework";
import { IAnimationTimeReference } from "./IAnimationTimeReference";

export class SkinnableTextureAnimation extends TextureAnimation
{
  readonly #animationStartTime = new Bindable(0);

  @resolved(IAnimationTimeReference, true)
  protected timeReference?: IAnimationTimeReference;

  constructor(readonly startAtCurrentTime: boolean = true)
  {
    super(startAtCurrentTime);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    if (this.timeReference != null)
    {
      this.clock = this.timeReference.clock!;
      this.#animationStartTime.bindTo(this.timeReference.animationStartTime);
    }

    this.#animationStartTime.addOnChangeListener(() => this.#updatePlaybackPosition(), { immediate: true });
  }

  #updatePlaybackPosition()
  {
    if (!this.timeReference)
      return;

    this.playbackPosition = this.timeReference.clock!.currentTime - this.timeReference.animationStartTime.value;
  }
}
