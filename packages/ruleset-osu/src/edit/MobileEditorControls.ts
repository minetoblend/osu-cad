import type { ClickEvent, Drawable, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { EditorButton, OsucadColors, ReverseFillFlowContainer, UpdateHandler } from '@osucad/common';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, BindableBoolean, CompositeDrawable, DrawableSprite, resolved, Vec2 } from 'osucad-framework';

export class MobileEditorControls extends CompositeDrawable {
  constructor(readonly additionalControls: Drawable[] = []) {
    super();
  }

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(new ButtonContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(6),
      children: [
        this.#undoButton = new MobileControlButton(
          getIcon('undo'),
          () => this.updateHandler.undo(),
        ),
        this.#redoButton = new MobileControlButton(
          getIcon('redo'),
          () => this.updateHandler.redo(),
          true,
        ),
        ...this.additionalControls,
      ].map(it => it.with({
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      })),
    }));

    this.canUndo.bindTo(this.updateHandler.canUndo);
    this.canRedo.bindTo(this.updateHandler.canRedo);

    this.canUndo.addOnChangeListener(evt => this.#undoButton.disabled.value = !evt.value, { immediate: true });
    this.canRedo.addOnChangeListener(evt => this.#redoButton.disabled.value = !evt.value, { immediate: true });
  }

  readonly canUndo = new BindableBoolean();

  readonly canRedo = new BindableBoolean();

  #undoButton!: MobileControlButton;

  #redoButton!: MobileControlButton;
}

class ButtonContainer extends ReverseFillFlowContainer {
  protected override forceNewRow(drawable: Drawable): boolean {
    return super.forceNewRow(drawable) || (drawable as any).forceNewRow === true;
  }
}

export class MobileControlButton extends EditorButton {
  constructor(
    readonly icon: Texture,
    readonly action: () => void,
    readonly forceNewRow = false,
  ) {
    super();

    this.anchor = Anchor.TopRight;
    this.origin = Anchor.TopRight;
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: this.icon,
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }

  override onClick(e: ClickEvent): boolean {
    this.action();
    return true;
  }

  protected override updateState() {
    super.updateState();

    this.#icon.color
      = this.active.value
        ? OsucadColors.primary
        : OsucadColors.text;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.active.value = true;

    return super.onMouseDown(e);
  }

  override onMouseUp(e: MouseUpEvent) {
    this.active.value = false;

    super.onMouseUp(e);
  }

  protected override get outlineTransitionDuration(): number {
    return 0;
  }
}
