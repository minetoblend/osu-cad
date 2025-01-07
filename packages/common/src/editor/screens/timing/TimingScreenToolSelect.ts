import type { HoverEvent, HoverLostEvent, KeyDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, Bindable, Button, dependencyLoader, DrawableSprite, EasingFunction, FastRoundedBox, FillDirection, FillFlowContainer, FillMode, Key, Vec2 } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { TimingScreenDependencies } from './TimingScreenDependencies';
import { TimingScreenTool } from './TimingScreenTool';

export class TimingScreenToolSelect extends FillFlowContainer {
  constructor() {
    super({
      spacing: new Vec2(4),
      relativeSizeAxes: Axes.Both,
      direction: FillDirection.Vertical,
      padding: 4,
    });
  }

  activeTool!: Bindable<TimingScreenTool>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    const { activeTool } = dependencies.resolve(TimingScreenDependencies);

    this.activeTool = activeTool.getBoundCopy();

    this.addAll(
      new TimingScreenToolSelectButton(TimingScreenTool.Select, getIcon('select')),
      new TimingScreenToolSelectButton(TimingScreenTool.Create, getIcon('pen')),
    );
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key.startsWith('Digit')) {
      const index = Number.parseInt(e.key.substring(5)) - 1;
      const button = this.children[index] as TimingScreenToolSelectButton;
      if (button) {
        button.action?.();
        return true;
      }
    }

    if (e.key === Key.Escape) {
      this.activeTool.value = TimingScreenTool.Select;
    }

    return false;
  }
}

export class TimingScreenToolSelectButton extends Button {
  constructor(
    readonly tool: TimingScreenTool,
    readonly icon: Texture,
  ) {
    super();
  }

  activeTool!: Bindable<TimingScreenTool>;

  @dependencyLoader()
  [Symbol('load')](dependencies: ReadonlyDependencyContainer) {
    const { activeTool } = dependencies.resolve(TimingScreenDependencies);

    this.activeTool = activeTool.getBoundCopy();

    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;

    this.addAllInternal(
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
      this.#icon = new DrawableSprite({
        texture: this.icon,
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.65,
        color: OsucadColors.text,
      }),
      this.#hoverOverlay = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
    );

    this.selected.valueChanged.addListener(this.#onSelectionChanged, this);

    this.activeTool.addOnChangeListener(e => this.selected.value = e.value === this.tool, { immediate: true });

    this.action = () => this.activeTool.value = this.tool;
  }

  #background!: FastRoundedBox;

  #icon!: DrawableSprite;

  #hoverOverlay!: FastRoundedBox;

  readonly selected = new Bindable(false);

  #onSelectionChanged() {
    if (this.selected.value) {
      this.#background.fadeTo(0.1, 200, EasingFunction.OutQuad);
      this.#icon.fadeColor(OsucadColors.primary, 200, EasingFunction.OutQuad);
    }
    else {
      this.#background.fadeOut(200, EasingFunction.OutQuad);
      this.#icon.fadeColor(OsucadColors.text, 200, EasingFunction.OutQuad);
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.#hoverOverlay.alpha = 0.1;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#hoverOverlay.alpha = 0;
  }
}
