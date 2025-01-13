import type { ClickEvent, HoverEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObjectComposer } from '../HitObjectComposer';
import type { Operator } from './Operator';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, BindableBoolean, CompositeDrawable, Container, DrawableSprite, EasingFunction, FastRoundedBox, FillDirection, FillFlowContainer, provide, resolved, TabbableContainer, Vec2 } from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';
import { IHitObjectComposer } from '../IHitObjectComposer';

@provide(OperatorBox)
export class OperatorBox extends CompositeDrawable {
  constructor(readonly operator: Operator) {
    super();

    this.autoSizeAxes = Axes.Both;

    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;

    const filter = new BackdropBlurFilter({
      strength: 10,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 15;

    this.filters = [filter];

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.95,
        cornerRadius: 4,
      }),
      this.#autoSizeContainer = new FillFlowContainer({
        direction: FillDirection.Vertical,
        autoSizeAxes: Axes.Both,
        padding: 6,
        masking: true,
        autoSizeEasing: EasingFunction.OutExpo,
        children: [
          new Container({ width: 100 }),
          new OperatorTitle(operator.title, this.expanded),
          this.#content = new FillFlowContainer({
            direction: FillDirection.Vertical,
            width: 200,
            margin: { top: 10 },
            autoSizeAxes: Axes.Y,
            spacing: new Vec2(4),
          }),
        ],
      }),
    ];
  }

  readonly expanded = new BindableBoolean();

  #content!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const properties = this.operator.properties;

    this.#content.addAll(
      ...properties.map(property => property.createDrawableRepresentation()),
    );
  }

  @resolved(IHitObjectComposer)
  composer!: HitObjectComposer;

  protected override loadComplete() {
    super.loadComplete();

    this.expanded.bindValueChanged((expanded) => {
      this.#content.bypassAutoSizeAxes = expanded.value ? Axes.None : Axes.Both;
    }, true);

    if (this.expanded.value && this.operator.prominent) {
      this.parent!.scheduler.add(() => {
        const focusTarget = this.findChildrenOfType(TabbableContainer);
        if (focusTarget.length > 0)
          this.getContainingFocusManager()?.changeFocus(focusTarget[0]);
      },
      );
    }
  }

  #firstUpdate = true;

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (this.#firstUpdate) {
      this.#firstUpdate = false;
      this.#autoSizeContainer.updateSubTree();
      this.finishTransforms(true);
      this.#autoSizeContainer.schedule(() => {
        this.#autoSizeContainer.autoSizeDuration = 150;
      });
    }
  }

  #autoSizeContainer: Container;

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    return true;
  }

  override onHover(e: HoverEvent): boolean {
    return true;
  }

  override onClick(e: ClickEvent): boolean {
    return true;
  }
}

class OperatorTitle extends FillFlowContainer {
  constructor(readonly title: string, expanded: BindableBoolean) {
    super({
      direction: FillDirection.Horizontal,
      autoSizeAxes: Axes.Both,
      spacing: new Vec2(4),
      padding: { right: 12 },
    });

    this.expanded = expanded.getBoundCopy();

    this.children = [
      new Container({
        size: 12,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        child: this.#icon = new DrawableSprite({
          texture: getIcon('caret-left'),
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          color: OsucadColors.text,
          rotation: Math.PI,
        }),
      }),
      new OsucadSpriteText({
        text: title,
        color: OsucadColors.text,
        fontSize: 12,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
    ];
  }

  #icon!: DrawableSprite;

  protected readonly expanded: BindableBoolean;

  protected override loadComplete() {
    super.loadComplete();

    this.expanded.bindValueChanged((expanded) => {
      this.#icon.rotateTo(
        expanded.value ? Math.PI * 1.5 : Math.PI,
        150,
        EasingFunction.OutExpo,
      );
    }, true);
  }

  override onClick(e: ClickEvent): boolean {
    this.expanded.toggle();
    return true;
  }
}
