import type { EditorScreenEntry } from '../screens/EditorScreenManager';
import { Anchor, Axes, Bindable, Box, Button, Container, dependencyLoader, EasingFunction, FillDirection, FillFlowContainer, LoadState, resolved, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';
import { EditorScreenManager } from '../screens/EditorScreenManager';

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

  override get content() {
    return this.#content;
  }

  @resolved(EditorScreenManager)
  screenManager!: EditorScreenManager;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#content,
      new Container({
        relativeSizeAxes: Axes.Y,
        child: this.#underline = new Box({
          width: 1,
          height: 2,
          color: OsucadColors.primaryHighlight,
          scale: new Vec2(0, 1),
        }),
      }),
    );

    for (const screenType of this.screenManager.entries) {
      this.add(new ScreenSelectButton(screenType));
    }

    this.updateSubTree();
  }

  #firstUpdate = true;

  setActiveButton(button: ScreenSelectButton) {
    this.schedule(() => {
      this.#underline.moveToX(button.x, 300, EasingFunction.OutExpo);
      this.#underline.scaleTo(new Vec2(button.drawSize.x, 1), 300, EasingFunction.OutExpo);

      if (this.#firstUpdate) {
        this.finishTransforms(true);
        this.#firstUpdate = false;
      }
    });
  }
}

class ScreenSelectButton extends Button {
  constructor(readonly entry: EditorScreenEntry) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.autoSizeAxes = Axes.X;

    this.action = () => {
      this.currentScreen.value = this.entry;
    };
  }

  currentScreen = new Bindable<EditorScreenEntry>(null!);

  @resolved(EditorScreenManager)
  screenManager!: EditorScreenManager;

  @dependencyLoader()
  load() {
    this.currentScreen.bindTo(this.screenManager.currentScreen);

    this.addAllInternal(
      new Container({
        autoSizeAxes: Axes.X,
        relativeSizeAxes: Axes.Y,
        padding: { horizontal: 5 },
        child: this.#text = new OsucadSpriteText({
          text: this.entry.name,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          color: OsucadColors.text,
          fontSize: 16,
        }),
      }),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.currentScreen.addOnChangeListener((screen) => {
      this.active = screen.value === this.entry;
    }, { immediate: true });
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
      this.#text.color = OsucadColors.primaryHighlight;
    }
    else {
      this.#text.color = OsucadColors.text;
    }
  }
}
