import type { TernaryState } from '@osucad/core';
import type { Bindable, ClickEvent, Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Texture } from 'pixi.js';
import { Additions, EditorAction, OsucadColors } from '@osucad/core';
import { Anchor, Axes, DrawableSprite, EmptyDrawable } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { HitSampleHighlightContainer } from './HitSampleHighlightContainer';
import { TernaryStateToggleButton } from './TernaryStateToggleButton';

export class AdditionToggleButton extends TernaryStateToggleButton implements IKeyBindingHandler<EditorAction> {
  constructor(
    readonly addition: Additions,
    bindable: Bindable<TernaryState>,
  ) {
    super();

    this.ternaryState.bindTo(bindable);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new HitSampleHighlightContainer(
      sample => !!((sample.addition ?? Additions.None) & this.addition),
    ).with({
      depth: 1,
    }));
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    let icon: Texture;

    switch (this.addition) {
      case Additions.Whistle:
        icon = getIcon('whistle');
        break;
      case Additions.Finish:
        icon = getIcon('finish');
        break;
      case Additions.Clap:
        icon = getIcon('clap');
        break;
      default:
        return new EmptyDrawable();
    }

    return this.#icon = new DrawableSprite({
      texture: icon,
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value)
      this.#icon.color = this.isHovered ? OsucadColors.primaryHighlight : OsucadColors.primary;
    else
      this.#icon.color = this.isHovered ? 0xFFFFFF : OsucadColors.text;
  }

  #keyPressed = false;

  protected override get armed(): boolean {
    return super.armed || this.#keyPressed;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  override onClick(e: ClickEvent): boolean {
    this.toggleState();
    return true;
  }

  protected get keyBinding() {
    switch (this.addition) {
      case Additions.Whistle:
        return EditorAction.ToggleWhistle;
      case Additions.Finish:
        return EditorAction.ToggleFinish;
      case Additions.Clap:
        return EditorAction.ToggleClap;
      default:
        throw new Error('Invalid addition type');
    }
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.repeat)
      return false;

    if (e.pressed === this.keyBinding) {
      this.toggleState();

      this.#keyPressed = true;
      this.updateState();

      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    if (e.pressed === this.keyBinding) {
      this.#keyPressed = false;
      this.updateState();
    }
  }
}
