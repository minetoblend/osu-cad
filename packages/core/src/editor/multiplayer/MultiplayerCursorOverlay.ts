import type { InputManager, ReadonlyDependencyContainer } from '@osucad/framework';
import type { CursorPosition } from '@osucad/multiplayer';
import type { ConnectedUser } from './ConnectedUsers';
import type { MultiplayerCursorArea } from './MultiplayerCursorArea';
import { Anchor, Axes, CompositeDrawable, Container, DrawableSprite, MouseButton, ProxyDrawable, resolved, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { MultiplayerClient } from './MultiplayerClient';

export class MultiplayerCursorOverlay extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  #areas: MultiplayerCursorArea[] = [];

  get areas(): readonly MultiplayerCursorArea[] {
    return this.#areas;
  }

  add(area: MultiplayerCursorArea) {
    this.#areas.push(area);
  }

  remove(area: MultiplayerCursorArea) {
    const index = this.#areas.indexOf(area);
    if (index >= 0)
      this.#areas.splice(index, 1);
  }

  #currentPosition: CursorPosition | null = null;

  #cursorProxy!: ProxyDrawable;

  #positionDidChange = true;

  #inputManager!: InputManager;

  readonly cursorContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  @resolved(MultiplayerClient)
  client!: MultiplayerClient;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.cursorContainer);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;

    for (const user of this.client.users.users)
      this.addInternal(new MultiplayerCursor(user, this));

    this.scheduler.addDelayed(() => {
      if (!this.#positionDidChange)
        return;

      this.client.socket.emit('updatePresence', 'cursor', this.#currentPosition);
      this.#positionDidChange = false;
    }, 50, true);
  }

  override update() {
    super.update();

    const hoveredTargets = this.#areas.filter(it => it.isHovered);

    let cursorPosition: CursorPosition | null = null;

    for (const target of hoveredTargets) {
      const position = target.toLocalCursorPosition(this.#inputManager.currentState.mouse.position);

      if (!position)
        continue;

      cursorPosition = {
        screen: target.key,
        pressed: this.#inputManager.currentState.mouse.isPressed(MouseButton.Left),
        position,
      };
      break;
    }

    this.#setCursorPosition(cursorPosition);
  }

  #setCursorPosition(position: CursorPosition | null) {
    if (this.#currentPosition) {
      if (position
        && Vec2.equals(position.position, this.#currentPosition.position)
        && position.pressed === this.#currentPosition.pressed
        && position.screen === this.#currentPosition.screen
      ) {
        return;
      }

      this.#currentPosition = position;
      this.#positionDidChange = true;
    }
    else {
      if (!position)
        return;

      this.#currentPosition = position;
      this.#positionDidChange = true;
    }
  }
}

class MultiplayerCursor extends CompositeDrawable {
  constructor(
    readonly user: ConnectedUser,
    readonly overlay: MultiplayerCursorOverlay,
  ) {
    super();

    this.addInternal(new Container({
      scale: 0.5,
      children: [
        new DrawableSprite({
          texture: getIcon('select'),
          anchor: Anchor.TopLeft,
          x: -5,
          y: -4,
          color: this.user.clientInfo.color,
        }),
      ],
    }));
  }

  protected override loadComplete() {
    super.loadComplete();

    this.updatePosition();

    this.user.presenceUpdated.addListener((key) => {
      if (key === 'cursor')
        this.updatePosition();
    });
  }

  #targetPosition = new Vec2();

  updatePosition() {
    const { cursor } = this.user.presence;

    if (!cursor) {
      this.fadeOut();
      this.setActiveArea(null);
      return;
    }

    const area = this.overlay.areas.find(it => it.key === cursor.screen);
    if (!area) {
      this.setActiveArea(null);
      this.fadeOut();
      return;
    }

    if (this.alpha === 0)
      this.fadeIn(150);

    const screenSpacePos = area.toScreenSpaceCursorPosition(Vec2.from(cursor.position));
    if (!screenSpacePos) {
      this.fadeOut();
      this.setActiveArea(null);
      return;
    }

    this.#targetPosition = this.overlay.toLocalSpace(screenSpacePos);

    this.setActiveArea(area);
  }

  #activeArea: Container | null = null;
  #currentProxy?: ProxyDrawable;

  protected setActiveArea(area: MultiplayerCursorArea | null) {
    if (this.#activeArea === area)
      return;

    this.#currentProxy?.expire();
    this.#currentProxy = undefined;
    this.#activeArea = area;
    if (area?.useProxy === false)
      this.#activeArea = this.overlay.cursorContainer;

    if (this.#activeArea) {
      const proxy = this.#currentProxy = new ProxyDrawable(this);
      this.#activeArea.add(proxy);

      if (this.position.distance(this.#targetPosition) > 50) {
        // we likely just teleported if the distance is too big
        this.fadeInFromZero(150);
      }
    }
  }

  override update() {
    super.update();

    this.position = Vec2.lerp(this.#targetPosition, this.position, Math.exp(-0.03 * this.time.elapsed));
  }
}
