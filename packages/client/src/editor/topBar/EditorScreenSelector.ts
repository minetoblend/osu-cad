import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { HBox } from '@/framework/drawable/HBox';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { ComposeScreen } from '../screens/compose/ComposeScreen';
import { NoArgsConstructor } from '@osucad/common';
import { EditorScreen } from '../screens/EditorScreen';
import { EditorScreenContainer } from '../screens/EditorScreenContainer';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { SetupScreen } from '../screens/setup/SetupScreen';

export class EditorScreenSelector extends ContainerDrawable {
  constructor() {
    super({
      padding: 4,
    });
  }

  buttons!: EditorScreenSelectorButton[];

  @dependencyLoader()
  load() {
    this.buttons = [
      new EditorScreenSelectorButton({
        title: 'Setup',
        screen: SetupScreen,
      }),
      new EditorScreenSelectorButton({
        title: 'Compose',
        screen: ComposeScreen,
      }),
    ];

    this.add(
      new HBox({
        children: this.buttons,
      }),
    );

    this.updateButtons();
  }

  @resolved(EditorScreenContainer)
  beatmapEditor!: EditorScreenContainer;

  updateButtons() {
    
  }
}

class EditorScreenSelectorButton extends ContainerDrawable {
  constructor(
    options: DrawableOptions & {
      title: string;
      screen: NoArgsConstructor<EditorScreen>;
    },
  ) {
    super({
      padding: 4,
    });

    this.add(this.background);
    this.title = this.add(
      new DrawableText({
        text: options.title,
        fontSize: 12,
        color: 0xb6b6c3,
        anchor: Anchor.CentreLeft,
        origin: Anchor.CentreLeft,
        margin: new MarginPadding(4),
      }),
    );
    this.screen = options.screen;
  }

  background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 2,
    alpha: 0,
  });

  title: DrawableText;

  screen: NoArgsConstructor<EditorScreen>;

  get requiredSizeToFit() {
    return this.title.requiredSizeToFit.add({
      x: this.title.margin.horizontal,
      y: this.title.margin.vertical,
    });
  }

  override get drawSize() {
    return this.requiredSizeToFit;
  }

  #active = false;

  get active() {
    return this.#active;
  }

  set active(value: boolean) {
    this.#active = value;
    this.title.color = value ? 0x32d2ac : 0xb6b6c3;
  }

  @resolved(EditorScreenContainer)
  screenContainer!: EditorScreenContainer;

  onMouseDown(event: MouseDownEvent): boolean {
    if(event.left) {
      this.screenContainer.currentScreen = new this.screen();
    }
    return true;
  }
}
