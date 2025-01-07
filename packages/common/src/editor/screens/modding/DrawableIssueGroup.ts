import type { Bindable, ClickEvent, Container, Drawable, HoverEvent, HoverLostEvent } from 'osucad-framework';
import type { Check } from '../../../verifier/Check';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, BindableBoolean, CompositeDrawable, DrawableSprite, EasingFunction, FillDirection, FillFlowContainer, MaskingContainer, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';

export class DrawableIssueGroup extends FillFlowContainer {
  constructor(readonly check: Check) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.direction = FillDirection.Vertical;
    this.spacing = new Vec2(5);
    this.margin = { bottom: 15 };

    this.internalChildren = [
      new FillFlowContainer({
        direction: FillDirection.Horizontal,
        autoSizeAxes: Axes.Both,
        spacing: new Vec2(2),
        children: [
          new OsucadSpriteText({
            text: check.metadata.message,
            color: OsucadColors.text,
            fontSize: 15,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new ExpandButton(this.expanded.getBoundCopy()),
        ],
      }),
      new MaskingContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        autoSizeDuration: 200,
        autoSizeEasing: EasingFunction.OutExpo,
        child: this.#content = new FillFlowContainer({
          direction: FillDirection.Vertical,
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          spacing: new Vec2(5),
          padding: 0,
        }),
      }),
    ];
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  readonly expanded = new BindableBoolean(true);

  protected override loadComplete() {
    super.loadComplete();

    this.expanded.valueChanged.addListener((expanded) => {
      if (expanded.value) {
        this.#content.bypassAutoSizeAxes = Axes.None;
        this.#content.fadeIn(200);
      }
      else {
        this.content.bypassAutoSizeAxes = Axes.Y;
        this.#content.fadeOut(200);
      }
    });
  }

  override onClick(e: ClickEvent): boolean {
    this.expanded.value = !this.expanded.value;
    return true;
  }

  override get removeWhenNotAlive(): boolean {
    return false;
  }

  override get shouldBeAlive(): boolean {
    return super.shouldBeAlive && this.#content.children.some(it => it.shouldBeAlive);
  }
}

class ExpandButton extends CompositeDrawable {
  constructor(readonly expanded: Bindable<boolean>) {
    super();

    this.size = new Vec2(14);
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.CenterLeft;

    let icon: DrawableSprite;

    this.alpha = 0.25;

    this.addInternal(icon = new DrawableSprite({
      relativeSizeAxes: Axes.Both,
      texture: getIcon('caret-left'),
      rotation: -Math.PI * 0.5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    expanded.valueChanged.addListener((expanded) => {
      icon.rotateTo(expanded.value ? -Math.PI * 0.5 : Math.PI * 0.5, 200, EasingFunction.OutExpo);
    });
  }

  override onHover(e: HoverEvent): boolean {
    this.alpha = 0.5;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.alpha = 0.25;
  }
}
