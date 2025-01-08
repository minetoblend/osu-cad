import type { ClickEvent, Drawable, KeyDownEvent } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, dependencyLoader, EmptyDrawable, FillDirection, FillFlowContainer, Key, MarginPadding, resolved } from 'osucad-framework';
import { UpdateHandler } from '../../../crdt/UpdateHandler';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { TextBox } from '../../../userInterface/TextBox';
import { LayeredTimeline } from '../../ui/timeline/LayeredTimeline';
import { TimingScreenBadge } from './TimingScreenBadge';

export abstract class TimingScreenInputBadge extends TimingScreenBadge {
  protected constructor(override readonly backgroundColor: ColorSource) {
    super();
  }

  #textBox!: TextBox;

  suffix?: string;

  protected get textBox() {
    return this.#textBox;
  }

  @resolved(LayeredTimeline)
  protected layeredTimeline!: LayeredTimeline;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  @dependencyLoader()
  [Symbol('load')]() {
    const content = new FillFlowContainer<Drawable>({
      direction: FillDirection.Horizontal,
      autoSizeAxes: Axes.Both,
      children: [
        this.#textBox = new TimingScreenInputBadgeTextBox().with({
          color: this.backgroundColor,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }).withTabbableContentContainer(this.layeredTimeline),
      ],
    });

    if (this.suffix) {
      content.add(new OsucadSpriteText({
        fontSize: 12,
        color: this.backgroundColor,
        text: this.suffix ?? '',
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        margin: { left: -2, right: 5 },
      }));
    }

    this.add(content);

    this.textBox.onCommit.addListener((text) => {
      this.onCommit(text);
      this.updateHandler.commit();
    });
  }

  protected abstract onCommit(text: string): void;

  override onClick(e: ClickEvent): boolean {
    this.schedule(() => this.getContainingFocusManager()?.changeFocus(this.textBox));
    return true;
  }
}

class TimingScreenInputBadgeTextBox extends TextBox {
  constructor() {
    super();

    this.alwaysPresent = true;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.height = 20;
    this.relativeSizeAxes = Axes.None;
    this.autoSizeAxes = Axes.X;
  }

  protected override createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      fontSize: 12,
    });
  }

  override get text(): string {
    return super.text;
  }

  override set text(value: string) {
    super.text = value;
  }

  protected override createBackground(): Drawable {
    return new EmptyDrawable();
  }

  protected override get textContainerPadding(): MarginPadding {
    return new MarginPadding({ horizontal: 5, vertical: 4 });
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Enter && !e.altPressed) {
      this.commit();
      return true;
    }

    return super.onKeyDown(e);
  }

  override onFocus(): boolean {
    if (!super.onFocus())
      return false;

    this.selectAll();

    return true;
  }
}
