import type { Drawable } from '../graphics/drawables/Drawable';
import type { MouseButton } from './state/MouseButton';
import type { IInput } from './stateChanges/IInput';
import { Container } from '../graphics/containers/Container';
import { Visibility } from '../graphics/containers/VisibilityContainer';
import { Axes } from '../graphics/drawables/Axes';
import { Vec2 } from '../math';
import { ManualInputHandler } from './handlers/ManualInputHandler';
import { PassThroughInputManager } from './PassThroughInputManager';
import { MouseButtonInput } from './stateChanges/MouseButtonInput';
import { MousePositionAbsoluteInput } from './stateChanges/MousePositionAbsoluteInput';
import { TestCursorContainer } from './TestCursorContainer';

export class ManualInputManager extends PassThroughInputManager {
  readonly #handler: ManualInputHandler;

  override get content(): Container {
    return this.#content;
  }

  readonly #content: Container;

  #showVisualCursorGuide = true;

  get showVisualCursorGuide(): boolean {
    return this.#showVisualCursorGuide;
  }

  set showVisualCursorGuide(value: boolean) {
    if (value === this.#showVisualCursorGuide)
      return;

    this.#showVisualCursorGuide = value;
    this.#testCursor.state.value = value ? Visibility.Visible : Visibility.Hidden;
  }

  readonly #testCursor: TestCursorContainer;

  // TODO:  readonly platformActionContainer: LocalPlatformActionContainer;

  constructor() {
    super();

    this.addHandler((this.#handler = new ManualInputHandler()));

    this.addAllInternal(
      (this.#content = Container.create({
        relativeSizeAxes: Axes.Both,
      })),
      (this.#testCursor = new TestCursorContainer()),
    );

    this.useParentInput = true;
  }

  input(input: IInput) {
    this.useParentInput = false;
    this.#handler.enqueueInput(input);
  }

  moveMouseToDrawable(drawable: Drawable, offset: Vec2 | null = null) {
    this.moveMouseTo(drawable.toScreenSpace(drawable.layoutRectangle.center).add(offset ?? Vec2.zero()));
  }

  moveMouseTo(position: Vec2) {
    this.input(new MousePositionAbsoluteInput(position));
  }

  click(button: MouseButton) {
    this.pressButton(button);
    this.releaseButton(button);
  }

  pressButton(button: MouseButton) {
    this.input(MouseButtonInput.create(button, true));
  }

  releaseButton(button: MouseButton) {
    this.input(MouseButtonInput.create(button, false));
  }
}
