import type { Bindable, ClickEvent, Drawable, Key, KeyDownEvent, KeyUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { IComposeTool } from './IComposeTool';
import { Anchor, Axes, dependencyLoader, DrawableSprite } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { ToolbarButton } from './ToolbarButton';

export class ComposeToolButton extends ToolbarButton {
  constructor(
    readonly tool: IComposeTool,
    readonly keyBinding?: Key,
  ) {
    super();
  }

  #icon!: DrawableSprite;

  activeTool!: Bindable<IComposeTool>;

  @dependencyLoader()
  [Symbol('load')](dependencies: ReadonlyDependencyContainer) {
    const { activeTool } = dependencies.resolve(HitObjectComposerDependencies);
    this.activeTool = activeTool.getBoundCopy();

    this.activeTool.addOnChangeListener(tool => this.active.value = tool.value === this.tool, { immediate: true });
  }

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: this.tool.icon,
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value) {
      this.#icon.color = this.isHovered ? OsucadColors.primaryHighlight : OsucadColors.primary;
    }
    else {
      this.#icon.color = this.isHovered ? 0xFFFFFF : OsucadColors.text;
    }
  }

  #keyPressed = false;

  protected override get armed(): boolean {
    return super.armed || this.#keyPressed;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === this.keyBinding) {
      this.#keyPressed = true;
      this.activeTool.value = this.tool;
      this.updateState();
      return true;
    }

    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    if (e.key === this.keyBinding) {
      this.#keyPressed = false;
      this.updateState();
    }
  }

  override onClick(e: ClickEvent): boolean {
    this.activeTool.value = this.tool;
    return true;
  }
}
