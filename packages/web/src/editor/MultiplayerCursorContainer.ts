import type { ClientInfo } from '@osucad/multiplayer';
import type { InputManager, IVec2, MouseMoveEvent, Vec2 } from 'osucad-framework';
import { getIcon } from '@osucad/editor/OsucadIcons';
import { ConnectedUsers, MultiplayerClient, SignalKey } from '@osucad/multiplayer';
import { Axes, BindableBoolean, CompositeDrawable, dependencyLoader, DrawableSprite, resolved } from 'osucad-framework';

export class MultiplayerCursorContainer extends CompositeDrawable {
  constructor(readonly screenId: string) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(MultiplayerClient)
  private client!: MultiplayerClient;

  @resolved(ConnectedUsers)
  private users!: ConnectedUsers;

  @dependencyLoader()
  load() {
    this.client.onSignal.addListener(this.#onSignal, this);
    for (const user of this.users.users) {
      this.#userJoined(user.clientInfo);
    }

    this.users.userJoined.addListener(this.#userJoined, this);
    this.users.userLeft.addListener(this.#userLeft, this);
  }

  #userJoined(user: ClientInfo) {
    const cursor = new MultiplayerCursor(user.clientId);
    this.#cursors.set(user.clientId, cursor);
    this.addInternal(cursor);
  }

  #userLeft(user: ClientInfo) {
    const cursor = this.#cursors.get(user.clientId);
    if (cursor) {
      this.#cursors.delete(user.clientId);
      cursor.expire();
    }
  }

  readonly #cursors = new Map<number, MultiplayerCursor>();

  #onSignal(evt: { clientId: number; key: SignalKey; data: any }) {
    if (evt.key !== SignalKey.Cursor)
      return;

    const cursor = this.#cursors.get(evt.clientId);
    const shouldBeVisible = this.screenId === evt.data.screen;

    if (cursor) {
      console.log(cursor, evt.data);
      cursor.visible.value = shouldBeVisible;
      if (shouldBeVisible && evt.data.position)
        cursor.position = evt.data.position;
    }
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  #inputManager!: InputManager;

  protected loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
    const mousePosition = this.toLocalSpace(
      this.#inputManager.currentState.mouse.position,
    );

    this.onMousePositionChanged(mousePosition);
    this.scheduler.addDelayed(() => {
      if (this.#newPosition) {
        this.client.emitSignal(SignalKey.Cursor, {
          screen: this.screenId,
          position: this.#newPosition,
        });
        this.#newPosition = null;
      }
    }, 17, true);
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    this.onMousePositionChanged(e.mousePosition);

    return false;
  }

  #newPosition: IVec2 | null = null;

  onMousePositionChanged(position: Vec2) {
    this.#newPosition = { x: position.x, y: position.y };
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);
    this.client.onSignal.removeListener(this.#onSignal, this);
    this.users.userJoined.removeListener(this.#userJoined, this);
    this.users.userLeft.removeListener(this.#userLeft, this);

    this.client.emitSignal(SignalKey.Cursor, {
      screen: null,
    });
  }
}

export class MultiplayerCursor extends CompositeDrawable {
  constructor(
    readonly clientId: number,
  ) {
    super();

    this.addInternal(new DrawableSprite({
      texture: getIcon('select'),
      x: -4,
      y: -3,
    }));
  }

  visible = new BindableBoolean(false);

  protected loadComplete() {
    super.loadComplete();
    this.visible.addOnChangeListener(visible => this.alpha = visible.value ? 1 : 0, { immediate: true });
  }
}
