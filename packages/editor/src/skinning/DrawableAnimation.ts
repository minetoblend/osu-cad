import { Bindable, TextureAnimation } from 'osucad-framework';

export class SkinnableTextureAnimation extends TextureAnimation {
  readonly #animationStartTime = new Bindable(0);

  constructor(readonly startAtCurrentTime: boolean = true) {
    super(startAtCurrentTime);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#animationStartTime.addOnChangeListener(() => this.#updatePlaybackPosition(), { immediate: true });
  }

  #updatePlaybackPosition() {
    // if (timeReference == null)
    //   return;

    // PlaybackPosition = timeReference.Clock.CurrentTime - timeReference.AnimationStartTime.Value;
  }
}
