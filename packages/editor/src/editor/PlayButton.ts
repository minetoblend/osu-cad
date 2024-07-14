import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  dependencyLoader,
  DrawableSprite,
  FillMode,
  MouseButton,
  MouseDownEvent,
  resolved,
} from 'osucad-framework';
import { ThemeColors } from './ThemeColors';
import gsap from 'gsap';
import { EditorClock } from './EditorClock';

export class PlayButtonContainer extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 10,
        child: new PlayButton(),
      }),
    );
  }
}

export class PlayButton extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(
      (this.#icon = new DrawableSprite({
        texture: useAsset('icon:play'),
        relativeSizeAxes: Axes.Both,
        color: this.colors.text,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      })),
    );
  }

  #icon!: DrawableSprite;

  onHover() {
    this.#icon.color = 0xffffff;

    return true;
  }

  onHoverLost() {
    this.#icon.color = this.colors.text;

    return true;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      gsap.killTweensOf(this.#icon);

      this.#icon.scale = 0.9;

      if (this.editorClock.isRunning) {
        this.editorClock.stop();
      } else {
        this.editorClock.start();
      }

      return true;
    }

    return false;
  }

  onMouseUp() {
    gsap.to(this.#icon, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.1,
      ease: 'back.out',
    });

    return true;
  }

  #isPlaying = false;

  update() {
    super.update();

    if (this.editorClock.isRunning !== this.#isPlaying) {
      this.#isPlaying = this.editorClock.isRunning;
      this.#icon.texture = this.#isPlaying
        ? useAsset('icon:pause')
        : useAsset('icon:play');
    }
  }
}
