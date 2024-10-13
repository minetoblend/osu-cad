import type {
  DependencyContainer,
  FocusLostEvent,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyBindingReleaseEvent,
  MouseDownEvent,
} from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSoundState } from '../../../beatmap/hitSounds/BindableHitSound';
import {
  Anchor,
  Axes,
  Bindable,
  BindableBoolean,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  MaskingContainer,
  MouseButton,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';

import { SampleSet } from '../../../beatmap/hitSounds/SampleSet';
import { SampleType } from '../../../beatmap/hitSounds/SampleType';
import { OsucadConfigManager } from '../../../config/OsucadConfigManager';
import { OsucadSettings } from '../../../config/OsucadSettings';
import { OsucadIcons } from '../../../OsucadIcons';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { EditorAction } from '../../EditorAction';
import { EditorDependencies } from '../../EditorDependencies';
import { ThemeColors } from '../../ThemeColors';
import { SampleHighlightContainer } from './SampleHighlightContainer';

const buttonSize = new Vec2(46, 42);

export class SampleSetControl extends CompositeDrawable {
  constructor(readonly title: string = 'Sampleset', readonly additions = false) {
    super();
  }

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  protected hitSoundState!: HitSoundState;

  readonly expanded = new BindableBoolean();

  sampleSet = new Bindable(SampleSet.Auto);

  alwaysExpanded = new BindableBoolean(true);

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { hitSound } = dependencies.resolve(EditorDependencies);

    this.hitSoundState = hitSound;

    this.config.bindWith(
      OsucadSettings.SampleSetExpanded,
      this.alwaysExpanded,
    );

    this.sampleSet.bindTo(
      this.additions
        ? this.hitSoundState.additionsSampleSetBindable
        : this.hitSoundState.sampleSetBindable,
    );

    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        autoSizeAxes: Axes.Both,
        children: [
          new Header(this.title, this.alwaysExpanded),
          new Container({
            autoSizeAxes: Axes.Both,
            children: [
              this.#mask = new MaskingContainer({
                autoSizeAxes: Axes.Y,
                cornerRadius: 5,
                children: [
                  new Box({
                    relativeSizeAxes: Axes.Both,
                    color: 0x222228,
                    alpha: 0.8,
                  }),
                  this.#movementContainer = new FillFlowContainer<SampleSetButton>({
                    autoSizeAxes: Axes.Both,
                    children: [
                      new SampleSetButton(SampleSet.Auto, 'Auto', OsucadIcons.get('sampleset-auto'), this.additions),
                      new SampleSetButton(SampleSet.Normal, 'Normal', OsucadIcons.get('sampleset-normal'), this.additions),
                      new SampleSetButton(SampleSet.Soft, 'Soft', OsucadIcons.get('sampleset-soft'), this.additions),
                      new SampleSetButton(SampleSet.Drum, 'Drum', OsucadIcons.get('sampleset-drum'), this.additions),
                    ],
                  }),
                  this.#activeHighlight = new RoundedBox({
                    size: buttonSize,
                    cornerRadius: 5,
                    fillAlpha: 0,
                    outlines: [
                      {
                        color: 0xC0BFBD,
                        width: 1.5,
                        alpha: 0.25,
                        alignment: 2,
                      },
                      {
                        color: this.theme.primary,
                        width: 1.5,
                        alignment: 1,
                      },
                    ],
                  }),
                ],
              }),
              this.#sampleHighlights = new FillFlowContainer({
                autoSizeAxes: Axes.Both,
                children: [
                  new Container({
                    size: buttonSize,
                    child: new SampleHighlightContainer(
                      this.additions ? [SampleType.Whistle, SampleType.Finish, SampleType.Clap, SampleType.SliderWhistle] : SampleType.Normal,
                      SampleSet.Auto,
                      5,
                    ),
                  }),
                  new Container({
                    size: buttonSize,
                    child: new SampleHighlightContainer(
                      this.additions ? [SampleType.Whistle, SampleType.Finish, SampleType.Clap, SampleType.SliderWhistle] : SampleType.Normal,
                      SampleSet.Normal,
                      5,
                    ),
                  }),
                  new Container({
                    size: buttonSize,
                    child: new SampleHighlightContainer(
                      this.additions ? [SampleType.Whistle, SampleType.Finish, SampleType.Clap, SampleType.SliderWhistle] : SampleType.Normal,
                      SampleSet.Soft,
                      5,
                    ),
                  }),
                  new Container({
                    size: buttonSize,
                    child: new SampleHighlightContainer(
                      this.additions ? [SampleType.Whistle, SampleType.Finish, SampleType.Clap, SampleType.SliderWhistle] : SampleType.Normal,
                      SampleSet.Drum,
                      5,
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }

  #sampleHighlights!: FillFlowContainer;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  protected loadComplete() {
    super.loadComplete();

    if (this.alwaysExpanded.value)
      this.expanded.value = true;

    this.alwaysExpanded.addOnChangeListener((e) => {
      this.expanded.value = e.value;
    });

    this.expanded.valueChanged.addListener(this.#updatePositions, this);

    this.sampleSet.valueChanged.addListener(this.#updatePositions, this);

    this.#updatePositions();
  }

  #updatePositions() {
    const index = this.#movementContainer.children.findIndex(c => c.sampleSet === this.sampleSet.value);

    if (index !== -1) {
      if (this.expanded.value) {
        this.#movementContainer.moveToX(0, 200, EasingFunction.OutExpo);
        this.#activeHighlight.moveToX(this.#movementContainer.children.findIndex(c => c.sampleSet === this.sampleSet.value) * buttonSize.x, 200, EasingFunction.OutExpo);
      }
      else {
        this.#movementContainer.moveToX(-index * buttonSize.x, 200, EasingFunction.OutExpo);
        this.#activeHighlight.moveToX(0, 200, EasingFunction.OutExpo);
      }
    }

    this.#sampleHighlights.alpha = this.expanded.value ? 1 : 0;

    let targetWidth = buttonSize.x;
    if (this.expanded.value) {
      targetWidth = this.#movementContainer.children.length * buttonSize.x;
    }

    this.#mask.resizeWidthTo(targetWidth, 200, EasingFunction.OutExpo);
  }

  #mask!: Container;

  #movementContainer!: Container<SampleSetButton>;

  #activeHighlight!: RoundedBox;

  onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }

  get acceptsFocus(): boolean {
    return true;
  }

  onFocus() {
    this.expanded.value = true;
  }

  onFocusLost(e: FocusLostEvent) {
    if (this.alwaysExpanded.value)
      return;

    this.expanded.value = false;
  }

  onClick(): boolean {
    if (!this.expanded.value) {
      this.expanded.value = true;
      return true;
    }

    return false;
  }
}

class SampleSetButton extends CompositeDrawable implements IKeyBindingHandler<EditorAction> {
  constructor(readonly sampleSet: SampleSet, readonly text: string, readonly icon: Texture, readonly additions = false) {
    super();

    this.size = buttonSize;
  }

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { hitSound } = dependencies.resolve(EditorDependencies);

    this.hitSoundState = hitSound;

    this.addAllInternal(
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new DrawableSprite({
            texture: this.icon,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            size: new Vec2(18, 18),
            y: -6,
          }),
          new OsucadSpriteText({
            text: this.text,
            fontSize: 10,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            y: 8,
          }),
        ],
      }),
    );

    const bindable = this.additions
      ? this.hitSoundState.additionsSampleSetBindable
      : this.hitSoundState.sampleSetBindable;

    this.isActive.valueChanged.addListener(this.#updateState, this);

    bindable.addOnChangeListener(e => this.isActive.value = e.value === this.sampleSet, { immediate: true });

    this.#updateState();
  }

  #content!: Container;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #updateState() {
    if (this.isActive.value) {
      this.#content.color = this.isHovered ? this.theme.primaryHighlight : this.theme.primary;
    }
    else {
      this.#content.color = this.isHovered ? 0xFFFFFF : this.theme.text;
    }

    if (this.armed)
      this.#content.scaleTo(0.85, 300, EasingFunction.OutQuart);
    else
      this.#content.scaleTo(1, 300, EasingFunction.OutBack);
  }

  protected hitSoundState!: HitSoundState;

  activate() {
    if (this.additions)
      this.hitSoundState.setAdditionSampleSet(this.sampleSet, true);
    else
      this.hitSoundState.setSampleSet(this.sampleSet, true);
  }

  get acceptsFocus(): boolean {
    return true;
  }

  isActive = new BindableBoolean();

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.armed = true;

      if (!this.findClosestParentOfType(SampleSetControl)!.expanded.value)
        return false;

      return true;
    }

    return false;
  }

  onMouseUp(e: MouseDownEvent) {
    if (e.button === MouseButton.Left)
      this.armed = false;
  }

  onClick(): boolean {
    if (!this.findClosestParentOfType(SampleSetControl)!.expanded.value)
      return false;
    this.activate();

    return true;
  }

  onHover(): boolean {
    this.#updateState();
    return false;
  }

  onHoverLost() {
    this.#updateState();
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === this.keyBinding;
  }

  #armed = false;

  get armed() {
    return this.#armed;
  }

  protected set armed(value) {
    if (value === this.#armed)
      return;

    this.#armed = value;

    this.#updateState();
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.keyBinding) {
      this.armed = true;
      this.activate();
      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    if (e.pressed === this.keyBinding) {
      this.armed = false;
    }
  }

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
    }
    else {
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
}

class Header extends FillFlowContainer {
  constructor(readonly title: string, alwaysExpanded: BindableBoolean) {
    super({
      direction: FillDirection.Horizontal,
      autoSizeAxes: Axes.Both,
      padding: { bottom: 2 },
      spacing: new Vec2(2),
    });

    this.children = [
      new OsucadSpriteText({
        text: this.title,
        fontSize: 14,
        alpha: 0.9,
        margin: { left: 2 },
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new Container({
        size: 12,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        child: this.#icon = new DrawableSprite({
          texture: OsucadIcons.get('plus'),
          alpha: 0,
          size: 12,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    ];

    this.alwaysExpanded = alwaysExpanded.getBoundCopy();
  }

  readonly alwaysExpanded: BindableBoolean;

  readonly #icon: DrawableSprite;

  @dependencyLoader()
  load() {
    this.alwaysExpanded.addOnChangeListener((e) => {
      if (e.value)
        this.#icon.texture = OsucadIcons.get('minus');
      else
        this.#icon.texture = OsucadIcons.get('plus');
    }, { immediate: true });
  }

  get acceptsFocus(): boolean {
    // We want the parent to close on click
    return true;
  }

  onHover(): boolean {
    this.#icon.alpha = 1;
    return true;
  }

  onHoverLost() {
    this.#icon.alpha = 0;
  }

  onClick(): boolean {
    this.alwaysExpanded.toggle();
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#icon.scaleTo(0.85, 300, EasingFunction.OutQuart);
      return true;
    }

    return false;
  }

  onMouseUp(e: MouseDownEvent) {
    if (e.button === MouseButton.Left)
      this.#icon.scaleTo(1, 300, EasingFunction.OutBack);
  }
}
