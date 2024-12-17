import type {
  MouseDownEvent,
  SpriteText,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  dependencyLoader,
  MarginPadding,
  MouseButton,
  resolved,
  RoundedBox,
} from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorClock } from './EditorClock';
import { ThemeColors } from './ThemeColors';
import { TimestampFormatter } from './TimestampFormatter';

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
    this.background.fadeTo(0.1, 100);
    this.timestamp.color = 0xCCCCDE;
    return false;
  }

  override onHoverLost(): boolean {
    this.background.fadeOut(100);
    this.timestamp.color = 0xB6B6C3;
    this.timestamp.scaleTo(1, 100);
    return false;
  }

  override onMouseDown(event: MouseDownEvent): boolean {
    if (event.button === MouseButton.Left) {
      this.timestamp.scaleTo(0.95, 100);
      const text = this.timestamp.text;
      navigator.clipboard.writeText(text);
      // TODO: Add toast
    }

    return true;
  }

  override onMouseUp(): boolean {
    this.timestamp.scaleTo(1, 100);
    return true;
  }
}
