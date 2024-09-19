import type {
  Bindable,
} from 'osucad-framework';
import {
  Anchor,

  Axes,
  Box,
  Button,
  Container,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  LoadState,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { ThemeColors } from './ThemeColors';
import { EditorScreenType } from './screens/EditorScreenType';
import { CURRENT_SCREEN } from './InjectionTokens';

export class EditorScreenSelect extends Container {
  constructor() {
    super();
  }

  #underline!: Box;

  #content = new FillFlowContainer({
    direction: FillDirection.Horizontal,
    relativeSizeAxes: Axes.Y,
    autoSizeAxes: Axes.X,
    spacing: new Vec2(5),
  });

  get content() {
    return this.#content;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#content,
      new Container({
        relativeSizeAxes: Axes.Y,
        child: this.#underline = new Box({
          width: 1,
          height: 2,
          color: this.colors.primaryHighlight,
          scale: new Vec2(0, 1),
        }),
      }),
    );

    this.addAll(
      new ScreenSelectButton('Setup', EditorScreenType.Setup),
      new ScreenSelectButton('Compose', EditorScreenType.Compose),
      new ScreenSelectButton('Timing', EditorScreenType.Timing),
    );

    this.updateSubTree();
  }

  setActiveButton(button: ScreenSelectButton) {
    this.schedule(() => {
      this.#underline.moveToX(button.x, 300, EasingFunction.OutExpo);
      this.#underline.scaleTo(new Vec2(button.drawSize.x, 1), 300, EasingFunction.OutExpo);
    });
  }
}

class ScreenSelectButton extends Button {
  constructor(
    readonly title: string,
    readonly screen: EditorScreenType,
  ) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.autoSizeAxes = Axes.X;

    this.action = () => {
      this.currentScreen.value = this.screen;
    };
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(CURRENT_SCREEN)
  currentScreen!: Bindable<EditorScreenType>;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new Container({
        autoSizeAxes: Axes.X,
        relativeSizeAxes: Axes.Y,
        padding: { horizontal: 5 },
        child: this.#text = new OsucadSpriteText({
          text: this.title,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          color: this.colors.text,
          fontSize: 16,
        }),
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.withScope(() => {
      this.currentScreen.addOnChangeListener(({ value: screen }) => {
        this.active = screen === this.screen;
      }, { immediate: true });
    });
  }

  #active = false;

  get active() {
    return this.#active;
  }

  set active(value: boolean) {
    if (this.#active === value)
      return;

    this.#active = value;

    this.#applyState();

    if (value)
      this.findClosestParentOfType(EditorScreenSelect)?.setActiveButton(this);
  }

  #text!: OsucadSpriteText;

  #applyState() {
    if (this.loadState === LoadState.NotLoaded)
      return;

    if (this.active) {
      this.#text.color = this.colors.primaryHighlight;
    }
    else {
      this.#text.color = this.colors.text;
    }
  }
}