import type { Bindable, InputManager, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { MouseEvent } from '../../../../framework/src/input/events/MouseEvent';
import type { ConnectedUser, CursorPosition } from './ConnectedUsers';
import { Axes, BindableBoolean, CompositeDrawable, lerp, MouseButton, resolved } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { DefaultCursor } from '../../graphics/cursor/DefaultCursorContainer';
import { animate } from '../../utils/animate';
import { EditorClock } from '../EditorClock';
import { MultiplayerClient } from './MultiplayerClient';

export class MultiplayerCursorContainer extends CompositeDrawable {
  constructor(readonly key: string) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(MultiplayerClient, true)
  client?: MultiplayerClient;

  readonly #cursors = new Map<number, MultiplayerCursor>();

  protected override loadComplete() {
    super.loadComplete();

    if (!this.client)
      return;

    for (const user of this.client.users.users)
      this.addCursor(user);

    this.client.users.userJoined.addListener(this.addCursor, this);
    this.client.users.userLeft.addListener(this.removeCursor, this);
  }

  addCursor(user: ConnectedUser) {
    const cursor = new MultiplayerCursor(this.key, user);
    this.#cursors.set(user.clientId, cursor);
    this.addInternal(cursor);
  }

  removeCursor(user: ConnectedUser) {
    const cursor = this.#cursors.get(user.clientId);
    if (cursor) {
      this.#cursors.delete(user.clientId);
      cursor
        .fadeOut(200)
        .expire();
    }
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    this.updateMousePosition(e);
    return false;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.updateMousePosition(e);
    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.updateMousePosition(e);
  }

  updateMousePosition(e: MouseEvent) {
    this.client?.users.setOwnCursor({
      position: e.mousePosition,
      screen: this.key,
      pressed: e.state.mouse.isPressed(MouseButton.Left),
    });
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (this.client) {
      this.client.users.userJoined.removeListener(this.addCursor, this);
      this.client.users.userLeft.removeListener(this.addCursor, this);

      if (this.client.users.ownCursor?.screen === this.key)
        this.client.users.setOwnCursor(null);
    }
  }
}

class MultiplayerCursor extends DefaultCursor {
  constructor(readonly screen: string, readonly user: ConnectedUser) {
    super();

    this.alwaysPresent = true;
  }

  cursorPosition!: Bindable<CursorPosition | null>;

  readonly mousePressed = new BindableBoolean(false);

  visible = false;

  #username!: OsucadSpriteText;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.alpha = 0;

    this.addInternal(this.#username = new OsucadSpriteText({
      text: this.user.clientInfo.username,
      y: getIcon('select').height,
      fontSize: 28,
      alpha: 0,
    }));

    this.cursorPosition = this.user.cursorPosition.getBoundCopy();
    this.cursorPosition.bindValueChanged(position => this.updatePosition(position.value), true);
    this.mousePressed.bindValueChanged((pressed) => {
      if (!this.visible)
        return;

      if (pressed.value)
        this.animateMouseDown();
      else
        this.animateMouseUp();
    });
  }

  #inputManager!: InputManager;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  updatePosition(cursor: CursorPosition | null) {
    this.mousePressed.value = cursor?.pressed ?? false;

    if (cursor == null || cursor.screen !== this.screen) {
      this.visible = false;
      return;
    }

    this.visible = true;
    this.position = cursor.position;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  override update() {
    super.update();

    const timeDiff = Math.abs(this.user.presence.clock.currentTime - this.editorClock.currentTime);

    const targetAlpha = this.visible
      ? animate(timeDiff, 4000, 1500, 0, 1)
      : 0;

    this.alpha = lerp(targetAlpha, this.alpha, Math.exp(-0.03 * this.time.elapsed));

    const cursorDistance = this.sprite.toLocalSpace(this.#inputManager.currentState.mouse.position).distance(this.sprite.drawSize.scale(0.5));

    const textAlpha = animate(cursorDistance, 50, 200, 1, 0);

    this.#username.alpha = lerp(textAlpha, this.#username.alpha, Math.exp(-0.03 * this.time.elapsed));
  }
}
