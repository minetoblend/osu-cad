import type {
  ClickEvent,
  ScrollContainer,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  Direction,
  FillDirection,
  FillFlowContainer,
  resolved,
} from 'osucad-framework';
import { MainScrollContainer } from '../editor/MainScrollContainer.ts';
import { ThemeColors } from '../editor/ThemeColors.ts';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';

export class PlaygroundExplorer extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    const playgrounds = import.meta.glob('../**/*.playground.ts', { eager: true });

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Y,
        width: 250,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
          }),
          this.#scroll = new MainScrollContainer(Direction.Vertical).with({ relativeSizeAxes: Axes.Both }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 250 },
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x151517,
          }),
          this.#content = new Container({
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }),
    );

    const container = new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
    });

    this.#scroll.add(container);

    for (const playground of Object.keys(playgrounds).sort()) {
      const name = playground.split('/').pop()!.split('.').shift()!;

      const button = new PlaygroundButton(this, name, playgrounds[playground]);

      container.add(button);

      if (window.location.search.includes(`playground=`)) {
        if (window.location.search.includes(`playground=${name}`))
          this.select(button);
      }
      else if (!this.#activeButton) {
        this.select(button);
      }
    }
  }

  #scroll!: ScrollContainer;

  #activeButton: PlaygroundButton | null = null;

  select(button: PlaygroundButton) {
    if (button === this.#activeButton)
      return;

    if (this.#activeButton)
      this.#activeButton.active.value = false;

    button.active.value = true;

    this.#activeButton = button;

    const module = button.module;

    if (this.#activeButton !== button)
      return;

    const constructor = module.default ?? module[Object.keys(module)[0]];

    this.#content.clear();
    this.#content.add(new (constructor as any)());

    window.history.pushState({}, '', `?playground=${button.playgroundName}`);
  }

  #content!: Container;
}

class PlaygroundButton extends CompositeDrawable {
  constructor(
    readonly playgroundExplorer: PlaygroundExplorer,
    readonly playgroundName: string,
    readonly module: any,
  ) {
    super();
  }

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Y;
    this.relativeSizeAxes = Axes.X;

    this.addAllInternal(
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 8, vertical: 4 },
        child: this.#text = new OsucadSpriteText({
          text: this.playgroundName,
          fontSize: 14,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
    );

    this.active.addOnChangeListener(e =>
      this.#text.color = e.value ? this.theme.primary : this.theme.text,
    );
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #background!: Box;

  #text!: OsucadSpriteText;

  active = new BindableBoolean();

  onHover() {
    this.#background.alpha = 0.1;

    return true;
  }

  onHoverLost() {
    this.#background.alpha = 0;
  }

  onClick(e: ClickEvent): boolean {
    this.playgroundExplorer.select(this);

    return true;
  }
}
