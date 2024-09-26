import type { CompositeDrawable } from 'osucad-framework';
import type { ControlPoint } from '../../../../beatmap/timing/ControlPoint.ts';
import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup.ts';
import {
  Anchor,
  Axes,
  Bindable,
  BindableBoolean,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  resolved,
  Vec2,
} from 'osucad-framework';
import { ControlPointInfo } from '../../../../beatmap/timing/ControlPointInfo.ts';
import { OsucadSpriteText } from '../../../../OsucadSpriteText';
import { Toggle } from '../../../../userInterface/Toggle';
import { EditorClock } from '../../../EditorClock.ts';
import { ControlPointProperties } from './ControlPointProperties.ts';
import { TABBABLE_CONTAINER } from './TABBABLE_CONTAINER.ts';

export abstract class ControlPointPropertiesSection<T extends ControlPoint = never> extends Container {
  protected constructor(readonly title: string) {
    super();
  }

  @resolved(TABBABLE_CONTAINER)
  protected tabbableContentContainer!: CompositeDrawable;

  controlPointGroup = new Bindable<ControlPointGroup | null>(null);

  controlPoint = new Bindable<T | null>(null);

  toggle!: Toggle;

  abstract getControlPointFromGroup(group: ControlPointGroup): T | null;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(new FillFlowContainer({
      autoSizeAxes: Axes.Y,
      relativeSizeAxes: Axes.X,
      direction: FillDirection.Vertical,
      padding: 12,
      spacing: new Vec2(8),
      children: [
        new FillFlowContainer({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          spacing: new Vec2(8),
          children: [
            this.toggle = new Toggle().with({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
            this.#title = new OsucadSpriteText({
              text: this.title,
              fontSize: 16,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
          ],
        }),
        this.#content,
      ],
    }));

    this.masking = true;

    this.createContent();

    this.toggle.onActivate.addListener(() => {
      this.controlPointGroup.value?.add(this.createControlPoint());
    });

    this.toggle.onDeactivate.addListener(() => {
      console.log(this.controlPoint.value, this.controlPointGroup.value);
      if (this.controlPoint.value)
        this.controlPointGroup.value?.remove(this.controlPoint.value);
    });

    this.active.valueChanged.addListener(this.applyState, this);

    this.applyState();

    this.controlPoint.addOnChangeListener((e) => {
      if (e.previousValue)
        this.schedule(() => this.unbindFromControlPoint(e.previousValue!));

      if (e.value)
        this.schedule(() => this.bindToControlPoint(e.value!));
    });

    this.controlPointGroup.addOnChangeListener((e) => {
      if (e.previousValue)
        this.unbindFromControlPointGroup(e.previousValue);

      if (e.value)
        this.bindToControlPointGroup(e.value);

      this.#updateControlPoint();
    }, { immediate: true });
  }

  protected loadComplete() {
    super.loadComplete();

    this.controlPointGroup.bindTo(this.findClosestParentOfType(ControlPointProperties)!.controlPointBindable);

    this.schedule(() => {
      this.autoSizeDuration = 300;
      this.autoSizeEasing = EasingFunction.OutExpo;
    });
  }

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  #title!: OsucadSpriteText;

  abstract createContent(): void;

  #content = new Container({
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    padding: { vertical: 6 },
  });

  get content() {
    return this.#content;
  }

  active = new BindableBoolean(false);

  applyState() {
    const active = this.active.value;

    this.toggle.value = active;

    this.#title.fadeTo(active ? 1 : 0.5, 200, EasingFunction.OutExpo);

    this.#content.bypassAutoSizeAxes = active ? Axes.None : Axes.Y;
    if (active)
      this.#content.fadeIn(200, EasingFunction.OutExpo);
    else
      this.#content.fadeOut(200, EasingFunction.OutExpo);
  }

  protected bindToControlPointGroup(controlPointGroup: ControlPointGroup) {
    controlPointGroup.added.addListener(this.#updateControlPoint, this);
    controlPointGroup.removed.addListener(this.#updateControlPoint, this);
  }

  protected unbindFromControlPointGroup(controlPointGroup: ControlPointGroup) {
    controlPointGroup.added.removeListener(this.#updateControlPoint, this);
    controlPointGroup.removed.removeListener(this.#updateControlPoint, this);
  }

  protected bindToControlPoint(controlPoint: T) {
  }

  protected unbindFromControlPoint(controlPoint: T) {
  }

  #updateControlPoint() {
    if (this.controlPointGroup.value)
      this.controlPoint.value = this.getControlPointFromGroup(this.controlPointGroup.value);
    else
      this.controlPoint.value = null;

    this.active.value = this.controlPoint.value !== null;
  }

  abstract createControlPoint(): T;

  get groupTime() {
    return this.controlPointGroup.value!.time;
  }
}
