import type { Bindable, HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, CompositeDrawable, EasingFunction, FastRoundedBox, FillFlowContainer, MouseButton, resolved, RoundedBox, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { ModdingComposer } from '../ModdingComposer';

export class ModdingColorPicker extends FillFlowContainer<ColorSwatch> {
  constructor() {
    super({
      relativeSizeAxes: Axes.Y,
      autoSizeAxes: Axes.X,
      spacing: new Vec2(10),
      padding: { horizontal: 10 },
      layoutDuration: 200,
      layoutEasing: EasingFunction.OutExpo,

      children: [
        new ColorSwatch(0xFFFFFF),
        new ColorSwatch(0xFF4B60),
        new ColorSwatch(0xFFA14B),
        new ColorSwatch(0xF5DD42),
        new ColorSwatch(0x90F542),
        new ColorSwatch(0x42F5A4),
        new ColorSwatch(0x2FD1ED),
        new ColorSwatch(0x3455F7),
        new ColorSwatch(0xA635FC),
        new ColorSwatch(0xE329AB),
      ],
    });
  }

  protected override loadComplete() {
    super.loadComplete();

    this.updateChildVisibility();
    this.finishTransforms(true);
  }

  expanded = false;

  override computeLayoutPositions(): Vec2[] {
    if (!this.expanded)
      return this.flowingChildren.map(() => new Vec2());

    return super.computeLayoutPositions();
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.expanded = !this.expanded;
      this.invalidateLayout();
      this.updateChildVisibility();
    }

    return true;
  }

  override add<U extends ColorSwatch>(child: U): U | undefined {
    const result = super.add(child);
    this.setLayoutPosition(child, this.children.length);
    return result;
  }

  updateChildVisibility() {
    for (const child of this.children) {
      const isActive = child.activeColor.value.toNumber() === child.swatchColor.toNumber();

      if (this.expanded || isActive)
        child.fadeIn(100);
      else
        child.fadeOut(100);

      if (isActive)
        this.changeChildDepth(child, -1);
      else if (child.depth !== 0)
        this.changeChildDepth(child, 0);
    }
  }

  protected override receivePositionalInputAtSubTree(screenSpacePos: Vec2): boolean {
    return this.expanded && super.receivePositionalInputAtSubTree(screenSpacePos);
  }
}

class ColorSwatch extends CompositeDrawable {
  constructor(color: ColorSource) {
    super();

    this.size = new Vec2(32);
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.CenterLeft;

    this.swatchColor = new Color(color);

    this.addAllInternal(
      this.#content = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        fillColor: color,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#hoverHighlight = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
    );
  }

  readonly swatchColor: Color;

  @resolved(() => ModdingComposer)
  composer!: ModdingComposer;

  activeColor!: Bindable<Color>;

  #content!: RoundedBox;

  #hoverHighlight!: FastRoundedBox;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.activeColor = this.composer.activeColor.getBoundCopy();

    this.activeColor.addOnChangeListener((color) => {
      if (color.value.toNumber() === this.swatchColor.toNumber()) {
        this.#content.outlines = [{
          color: 0xFFFFFF,
          width: 3,
          alpha: 0.5,
          alignment: 0,
        }];
        this.#content.alpha = 1;
      }
      else {
        this.#content.outlines = [];
        this.#content.alpha = 0.75;
      }
    }, { immediate: true });
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.activeColor.value = this.swatchColor;
      this.#content.scaleTo(0.9, 300, EasingFunction.OutQuart);
      return false;
    }

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.#content.scaleTo(1, 300, EasingFunction.OutBack);
      return true;
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.#hoverHighlight.alpha = 0.1;

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#hoverHighlight.alpha = 0;
  }
}
