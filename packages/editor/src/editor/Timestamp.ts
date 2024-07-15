import type {
  MouseDownEvent,
  SpriteText,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  MarginPadding,
  MouseButton,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import gsap from 'gsap';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorClock } from './EditorClock';
import { TimestampFormatter } from './TimestampFormatter';
import { ThemeColors } from './ThemeColors';

export class Timestamp extends CompositeDrawable {
  constructor() {
    super();
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(ThemeColors)
  themeColors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(this.background);
    this.addInternal(
      (this.timestamp = new OsucadSpriteText({
        text: '',
        color: this.themeColors.text,
        fontSize: 20,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
    );
  }

  #lastTimestamp = -1;

  background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    color: 0xFFFFFF,
    alpha: 0,
    cornerRadius: 4,
    margin: new MarginPadding({
      horizontal: -3,
    }),
  });

  timestamp!: SpriteText;

  override update(): void {
    super.update();

    const currentTime = this.editorClock.currentTime;
    if (this.#lastTimestamp === currentTime)
      return;
    this.#lastTimestamp = currentTime;
    this.timestamp.text = TimestampFormatter.formatTimestamp(currentTime);
  }

  override get drawSize() {
    return this.timestamp.drawSize;
  }

  override onHover(): boolean {
    gsap.to(this.background, {
      alpha: 0.1,
      duration: 0.1,
    });
    this.timestamp.color = 0xCCCCDE;
    return false;
  }

  override onHoverLost(): boolean {
    gsap.to(this.background, {
      alpha: 0,
      duration: 0.1,
    });
    this.timestamp.color = 0xB6B6C3;
    gsap.to(this.timestamp.scale, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.1,
    });
    return false;
  }

  override onMouseDown(event: MouseDownEvent): boolean {
    if (event.button === MouseButton.Left) {
      gsap.to(this.timestamp, {
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 0.1,
      });
      const text = this.timestamp.text;
      navigator.clipboard.writeText(text);
      // TODO: Add toast
    }

    return true;
  }

  override onMouseUp(): boolean {
    gsap.to(this.timestamp, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.1,
    });
    return true;
  }
}
