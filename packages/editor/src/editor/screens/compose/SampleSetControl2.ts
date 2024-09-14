import {
  Anchor,
  Axes,
  Bindable,
  BindableBoolean,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  MarginPadding,
  MouseButton,
  MouseDownEvent,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox.ts';
import { SampleSet } from '../../../beatmap/hitSounds/SampleSet.ts';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { SampleHighlightContainer } from './SampleHighlightContainer.ts';
import { SampleType } from '../../../beatmap/hitSounds/SampleType.ts';
import { OsucadConfigManager } from '../../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../../config/OsucadSettings.ts';
import { HITSOUND } from '../../InjectionTokens.ts';
import { HitSoundState } from '../../../beatmap/hitSounds/BindableHitSound.ts';
import { ThemeColors } from '../../ThemeColors.ts';
import { EditorAction } from '../../EditorAction.ts';

export class SampleSetControl extends CompositeDrawable {

  constructor(readonly title: string = 'Sampleset', readonly additions = false) {
    super();
  }

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  expanded = new Bindable(false);

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Both;

    this.config.bindWith(
      this.additions ? OsucadSettings.SampleSetExpanded : OsucadSettings.HitAnimations,
      this.expanded,
    );

    this.addAllInternal(
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        autoSizeAxes: Axes.Both,
        children: [
          new FillFlowContainer({
            direction: FillDirection.Horizontal,
            autoSizeAxes: Axes.Both,
            children: [
              new OsucadSpriteText({
                text: this.title,
                fontSize: 12,
                alpha: 0.9,
              }),
            ],
          }),
          new Container({
            autoSizeAxes: Axes.Both,
            children: [
              new FastRoundedBox({
                relativeSizeAxes: Axes.Both,
                cornerRadius: 5,
                color: 0x222228,
                alpha: 0.8,
                anchor: Anchor.Center,
                origin: Anchor.Center,
              }),
              new FillFlowContainer({
                autoSizeAxes: Axes.Both,
                layoutEasing: EasingFunction.OutExpo,
                children: [
                  new SampleSetButton(SampleSet.Auto, 'Auto', this.additions),
                  new SampleSetButton(SampleSet.Normal, 'Normal', this.additions),
                  new SampleSetButton(SampleSet.Soft, 'Soft', this.additions),
                  new SampleSetButton(SampleSet.Drum, 'Drum', this.additions),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }
}

class SampleSetButton extends CompositeDrawable implements IKeyBindingHandler<EditorAction> {

  constructor(readonly sampleSet: SampleSet, readonly text: string, readonly additions = false) {
    super();
  }

  @resolved(HITSOUND)
  protected hitSoundState!: HitSoundState;

  get keyBinding() {
    if (this.additions) {
      switch (this.sampleSet) {
        case SampleSet.Auto:
          return EditorAction.ToggleAdditionSampleSetAuto;
        case SampleSet.Normal:
          return EditorAction.ToggleAdditionSampleSetNormal;
        case SampleSet.Soft:
          return EditorAction.ToggleAdditionSampleSetSoft;
        case SampleSet.Drum:
          return EditorAction.ToggleAdditionSampleSetDrum;
      }
    } else {
      switch (this.sampleSet) {
        case SampleSet.Auto:
          return EditorAction.ToggleSampleSetAuto;
        case SampleSet.Normal:
          return EditorAction.ToggleSampleSetNormal;
        case SampleSet.Soft:
          return EditorAction.ToggleSampleSetSoft;
        case SampleSet.Drum:
          return EditorAction.ToggleSampleSetDrum;
      }
    }
  }

  isActive = new BindableBoolean();

  @dependencyLoader()
  load() {
    this.size = new Vec2(46, 42);
    this.addAllInternal(
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 5,
        color: 0xffffff,
        alpha: 0,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.8,
        children: [
          new OsucadSpriteText({
            text: this.text.slice(0, 1),
            fontSize: 14,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            y: -7,
          }),
          new OsucadSpriteText({
            text: this.text,
            fontSize: 10,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            y: 7,
          }),
        ],
      }),
      new SampleHighlightContainer(
        this.additions ? [SampleType.Whistle, SampleType.Finish, SampleType.Clap, SampleType.SliderWhistle] : SampleType.Normal,
        this.sampleSet,
      ),
      this.#outline = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 5,
        fillAlpha: 0,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.sampleSetBindable = (this.additions
      ? this.hitSoundState.additionsSampleSetBindable
      : this.hitSoundState.sampleSetBindable).getBoundCopy();

    this.sampleSetBindable.addOnChangeListener(e => this.isActive.value = e.value === this.sampleSet);

    this.isActive.valueChanged.addListener(this.updateState, this);

    this.isActive.value = this.sampleSetBindable.value === this.sampleSet;
  }

  loadComplete() {
    super.loadComplete();

    this.updateState();
  }

  sampleSetBindable!: Bindable<SampleSet>;

  #background!: FastRoundedBox;

  #content!: Container;

  onHover(): boolean {
    this.updateState();
    return true;
  }

  onHoverLost() {
    this.updateState();
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.armed = true;
      return true;
    }

    return false;
  }

  onMouseUp(e: MouseDownEvent) {
    if (e.button === MouseButton.Left)
      this.armed = false;
  }

  onClick(e: MouseDownEvent): boolean {
    this.activate()
    return true;
  }

  activate() {
    if (this.additions)
      this.hitSoundState.setAdditionSampleSet(this.sampleSet, true);
    else
      this.hitSoundState.setSampleSet(this.sampleSet, true);
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #outline!: RoundedBox;

  #outlineVisibility = 0;

  get outlineVisibility() {
    return this.#outlineVisibility;
  }

  set outlineVisibility(value: number) {
    if (value === this.#outlineVisibility)
      return;

    this.#outlineVisibility = value;
    this.#outline.alpha = value;

    this.#updateOutline();
  }

  #updateOutline() {
    if (this.outlineVisibility === 0) {
      this.#outline.outlines = [];
    } else {
      this.#outline.outlines = [
        {
          color: 0xC0BFBD,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32D2AC,
          width: 1.5 * this.outlineVisibility,
          alpha: this.outlineVisibility,
          alignment: 0,
        },
      ];
    }
  }

  updateState() {
    this.#content.fadeTo((this.isActive.value || this.isHovered) ? 1 : 0.8);

    if (this.armed)
      this.#content.scaleTo(0.85, 300, EasingFunction.OutQuart);
    else
      this.#content.scaleTo(1, 300, EasingFunction.OutBack);

    if (this.isActive.value) {
      this.#content.color = this.isHovered
        ? this.theme.primaryHighlight
        : this.theme.primary;
      this.#background.fadeTo(0.1, 200);
    } else {
      this.#content.color = this.isHovered ? 'white' : '#bbbec5';
      this.#background.fadeTo(0, 200);
    }

    this.transformTo('outlineVisibility', this.isActive.value ? 1 : 0, 200);
  }

  #armed = false;

  get armed() {
    return this.#armed;
  }

  protected set armed(value) {
    if (value === this.#armed)
      return;

    this.#armed = value;

    this.updateState();
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === this.keyBinding;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.keyBinding) {
      this.armed = true;
      this.activate();
      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.keyBinding) {
      this.armed = false;
      return true;
    }

    return false;
  }
}
