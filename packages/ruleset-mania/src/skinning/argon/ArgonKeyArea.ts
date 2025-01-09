import type { Drawable, IKeyBindingHandler, ITransformable, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer, ValueChangedEvent } from 'osucad-framework';
import type { Column } from '../../ui/Column';
import { IScrollingInfo, ScrollingDirection } from '@osucad/common';
import { Anchor, Axes, Bindable, ColorUtils, CompositeDrawable, Container, EasingFunction, FastRoundedBox, Interpolation, ProxyDrawable, resolved, RoundedBox, TypedTransform, Vec2 } from 'osucad-framework';
import { Color } from 'pixi.js';
import { BetterGlowFilter } from '../../graphics/BetterGlowFilter';
import { IColumn } from '../../ui/IColumn';
import { ManiaAction } from '../../ui/ManiaAction';
import { Stage } from '../../ui/Stage';
import { ArgonNotePiece } from './ArgonNotePiece';

export class ArgonKeyArea extends CompositeDrawable implements IKeyBindingHandler<ManiaAction> {
  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  #directionContainer!: Container;
  #background!: Drawable;

  #hitTargetLine!: Drawable;

  #bottomIcon!: Container;

  #topIcon!: Drawable;

  #accentColor!: Bindable<Color>;

  @resolved(IColumn)
  private column!: Column;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const icon_circle_size = 8;
    const icon_spacing = 7;
    const icon_vertical_offset = -30;

    this.internalChild = this.#directionContainer = new Container({
      relativeSizeAxes: Axes.X,
      height: Stage.HIT_TARGET_POSITION + ArgonNotePiece.CORNER_RADIUS * 2,
      children: [
        this.#background = new FastRoundedBox({
          cornerRadius: ArgonNotePiece.CORNER_RADIUS,
          relativeSizeAxes: Axes.Both,
          blendMode: 'add',
          alpha: 0,
        }),
        this.#hitTargetLine = new FastRoundedBox({
          relativeSizeAxes: Axes.X,
          anchor: Anchor.TopCenter,
          origin: Anchor.TopCenter,
          color: 0xC4C4C4,
          cornerRadius: ArgonNotePiece.CORNER_RADIUS,
          height: ArgonNotePiece.CORNER_RADIUS * 2,
          filters: [
            new BetterGlowFilter({
              radius: 0,
              alpha: 0,
              color: 0xFFFFFF,
            }),
          ],
        }),
        new Container({
          label: 'Icons',
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.TopCenter,
          origin: Anchor.TopCenter,
          children: [
            this.#bottomIcon = new Container({
              autoSizeAxes: Axes.Both,
              anchor: Anchor.BottomCenter,
              origin: Anchor.Center,
              blendMode: 'add',
              y: icon_vertical_offset,
              filters: [
                new BetterGlowFilter({
                  radius: 0,
                  alpha: 0,
                  color: 0xFFFFFF,
                }),
              ],
              children: [
                new FastRoundedBox({
                  size: icon_circle_size,
                  cornerRadius: icon_circle_size / 2,
                  anchor: Anchor.BottomCenter,
                  origin: Anchor.Center,

                }),
                new FastRoundedBox({
                  x: -icon_spacing,
                  y: icon_spacing * 1.2,
                  size: icon_circle_size,
                  cornerRadius: icon_circle_size / 2,
                  anchor: Anchor.BottomCenter,
                  origin: Anchor.Center,

                }),
                new FastRoundedBox({
                  x: icon_spacing,
                  y: icon_spacing * 1.2,
                  size: icon_circle_size,
                  cornerRadius: icon_circle_size / 2,
                  anchor: Anchor.BottomCenter,
                  origin: Anchor.Center,

                }),
              ],
            }),
            this.#topIcon = new RoundedBox({
              anchor: Anchor.TopCenter,
              origin: Anchor.Center,
              y: -icon_vertical_offset,
              size: new Vec2(22, 14),
              fillAlpha: 0,
              cornerRadius: 7,
              outlines: [{
                width: 3,
                color: 0xFFFFFF,
                alignment: 1,
              }],
              filters: [
                new BetterGlowFilter({
                  radius: 0,
                  alpha: 0,
                  color: 0xFFFFFF,
                }),
              ],
            }),
          ],
        }),
      ],
    });

    const scrollingInfo = dependencies.resolve(IScrollingInfo);

    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);

    this.#accentColor = this.column.accentColor.getBoundCopy();
    this.#accentColor.bindValueChanged((color) => {
      this.#background.color = ColorUtils.darkenSimple(color.value, 0.2);
      this.#bottomIcon.color = color.value;
    }, true);

    this.column.topLevelContainer.add(new ProxyDrawable(this));
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    if (direction.value === ScrollingDirection.Up) {
      this.#directionContainer.scale = new Vec2(1, -1);
      this.#directionContainer.anchor = Anchor.TopLeft;
      this.#directionContainer.origin = Anchor.BottomLeft;
    }
    else {
      this.#directionContainer.scale = 1;
      this.#directionContainer.anchor = Anchor.BottomLeft;
      this.#directionContainer.origin = Anchor.BottomLeft;
    }
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (e.pressed !== this.column.action.value)
      return false;

    const lighting_fade_in_duration = 70;
    const lightingColor = this.#getLightingColor();

    this.#background.flashColorTo(ColorUtils.lighten(this.#accentColor.value, 0.1), 200, EasingFunction.OutQuint)
      .fadeTo(1, lighting_fade_in_duration, EasingFunction.OutQuint)
      .then()
      .fadeTo(0.8, 500);

    this.#hitTargetLine.fadeColor(0xFFFFFF, lighting_fade_in_duration, EasingFunction.OutQuint);
    transformGlowTo(this.#hitTargetLine, this.#hitTargetLine.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0.4,
      radius: 15,
    }, lighting_fade_in_duration, EasingFunction.OutQuint);

    this.#topIcon.scaleTo(0.9, lighting_fade_in_duration, EasingFunction.OutQuint);
    transformGlowTo(this.#topIcon, this.#topIcon.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0.1,
      radius: 15,
    }, lighting_fade_in_duration, EasingFunction.OutQuint);

    this.#bottomIcon.fadeColor(0xFFFFFF, lighting_fade_in_duration, EasingFunction.OutQuint);
    transformGlowTo(this.#bottomIcon, this.#bottomIcon.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0.2,
      radius: 40,
    }, lighting_fade_in_duration, EasingFunction.OutQuint);

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<ManiaAction>) {
    if (e.pressed !== this.column.action.value)
      return;

    const lighting_fade_out_duration = 800;

    const lightingColor = this.#getLightingColor();

    this.#background.fadeTo(0.3, 50, EasingFunction.OutQuint)
      .then()
      .fadeOut(lighting_fade_out_duration, EasingFunction.OutQuint);

    this.#topIcon.scaleTo(1, 200, EasingFunction.OutQuint);
    transformGlowTo(this.#topIcon, this.#topIcon.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0,
      radius: 20,
    }, lighting_fade_out_duration, EasingFunction.OutQuint);

    this.#hitTargetLine.fadeColor(0xC4C4C4, lighting_fade_out_duration, EasingFunction.OutQuint);
    transformGlowTo(this.#hitTargetLine, this.#hitTargetLine.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0,
      radius: 20,
    }, lighting_fade_out_duration, EasingFunction.OutQuint);

    this.#bottomIcon.fadeColor(this.#accentColor.value, lighting_fade_out_duration, EasingFunction.OutQuint);
    transformGlowTo(this.#bottomIcon, this.#bottomIcon.filters[0] as BetterGlowFilter, {
      color: lightingColor,
      alpha: 0,
      radius: 20,
    }, lighting_fade_out_duration, EasingFunction.OutQuint);
  }

  #getLightingColor = () => Interpolation.valueAt(0.2, this.#accentColor.value, new Color(0xFFFFFF), 0, 1, EasingFunction.Default);
}

export function transformGlowTo<T extends Drawable>(target: T, filter: BetterGlowFilter, glow: GlowParams, duration: number = 0, easing: EasingFunction = EasingFunction.Default) {
  target.addTransform(
    // @ts-expect-error protected smh
    target.populateTransform(new GlowTransform<T>(filter), glow, duration, easing),
  );
}

interface GlowParams {
  radius: number;
  alpha: number;
  color: Color;
}

class GlowTransform<T extends ITransformable> extends TypedTransform<GlowParams, T> {
  constructor(readonly filter: BetterGlowFilter) {
    super();
  }

  override applyTo(target: T, time: number): void {
    this.filter.alpha = Interpolation.valueAt(time, this.startValue.alpha, this.endValue.alpha, this.startTime, this.endTime, this.easing);
    this.filter.radius = Interpolation.valueAt(time, this.startValue.radius, this.endValue.radius, this.startTime, this.endTime, this.easing);

    const progress = Interpolation.valueAt(time, 0, 1, this.startTime, this.endTime, this.easing);
    this.filter.color = Interpolation.interpolateColor(this.startValue.color, this.endValue.color, progress);
  }

  override readIntoStartValueFrom(target: T): void {
    this.startValue = {
      alpha: this.filter.alpha,
      radius: this.filter.radius,
      color: new Color(this.filter.color),
    };
  }

  override clone(): TypedTransform<GlowParams, T> {
    return new GlowTransform(this.filter);
  }

  override get targetMember(): string {
    return 'glow';
  }
}
