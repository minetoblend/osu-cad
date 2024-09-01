import type {
  InputManager,
  MouseMoveEvent,
} from 'osucad-framework';
import {
  Anchor,

  Axes,
  Bindable,
  CompositeDrawable,
  DrawableSprite,
  Vec2,
  dependencyLoader,
  lerp,
  resolved,
} from 'osucad-framework';
import type { UserActivity, UserSessionInfo } from '@osucad/common';
import { Assets, Graphics } from 'pixi.js';
import { ConnectedUsersManager } from '../../context/ConnectedUsersManager';
import { EditorClock } from '../../EditorClock';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { animate } from '../../../utils/animate';
import { getIcon } from '../../../OsucadIcons';

export class ComposerCursorContainer extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ConnectedUsersManager)
  userManager!: ConnectedUsersManager;

  #cursors = new Map<number, UserCursor>();

  @dependencyLoader()
  load() {
    for (const user of this.userManager.users) {
      this.#addUserCursor(user);
    }
    this.userManager.userActivityUpdated.addListener((user) => {
      const cursor = this.#cursors.get(user.sessionId);

      if (cursor) {
        cursor.activityChanged(user.presence.activity);
      }
    });
    this.userManager.userJoined.addListener((user) => {
      this.#addUserCursor(user);
    });
    this.userManager.userLeft.addListener((user) => {
      const cursor = this.#cursors.get(user.sessionId);
      if (cursor) {
        this.removeInternal(cursor);
        this.#cursors.delete(user.sessionId);
      }
    });

    this.#activity.addOnChangeListener(() => {
      this.#activityChanged = true;
    });
  }

  #addUserCursor(user: UserSessionInfo) {
    if (user.sessionId === this.userManager.ownUser.sessionId) {
      return;
    }

    const cursor = new UserCursor(user);
    this.#cursors.set(user.sessionId, cursor);
    this.addAllInternal(cursor);
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #activity = new Bindable<UserActivity<'composeScreen'>>({
    type: 'composeScreen',
    cursorPosition: { x: 0, y: 0 },
    currentTime: 0,
    mouseDown: false,
    isPlaying: false,
  });

  #activityChanged = false;

  #lastUpdate = 0;

  onMouseMove(e: MouseMoveEvent): boolean {
    this.#activity.value = {
      ...this.#activity.value,
      cursorPosition: e.mousePosition,
    };
    return false;
  }

  update() {
    super.update();

    if (this.editorClock.currentTime !== this.#activity.value.currentTime) {
      this.#activity.value = {
        ...this.#activity.value,
        currentTime: this.editorClock.currentTime,
      };
    }

    if (this.#activityChanged && this.time.current - this.#lastUpdate > 50) {
      this.#lastUpdate = this.time.current;
      this.#activityChanged = false;
      this.userManager.updateActivity({ ...this.#activity.value });
    }
  }

  receivePositionalInputAt(): boolean {
    return true;
  }
}

class UserCursor extends CompositeDrawable {
  constructor(readonly user: UserSessionInfo) {
    super();
    this.alwaysPresent = true;
    this.relativeSizeAxes = Axes.Both;
    this.alpha = 0;
  }

  avatar!: UserAvatar;

  @resolved(ConnectedUsersManager)
  userManager!: ConnectedUsersManager;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.avatar = new UserAvatar(this.user)),
      new DrawableSprite({
        texture: getIcon('select'),
        color: 0x000000,
        scale: 0.5,
        alpha: 0.25,
        y: 2,
      }),
      new DrawableSprite({
        texture: getIcon('select'),
        color: this.user.color,
        scale: 0.5,
      }),
    );
    this.avatar.x = 30;
    this.avatar.y = 25;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #activity: UserActivity | null = null;

  activityChanged(activity: UserActivity | null) {
    this.#activity = activity;

    if (!activity || activity.type !== 'composeScreen') {
      this.fadeOut(300);
      return;
    }

    this.moveTo(Vec2.from(activity.cursorPosition), 100);
  }

  update() {
    super.update();

    const t = Math.min(1, this.time.elapsed / 75);

    if (this.#activity?.type === 'composeScreen') {
      const userTime = this.#activity.currentTime;
      const currentTime = this.editorClock.currentTime;

      const difference = Math.abs(userTime - currentTime);

      const targetAlpha = animate(difference, 1000, 3000, 1, 0);

      this.alpha = lerp(this.alpha, targetAlpha, t);
    }

    const cursorPosition = this.toLocalSpace(
      this.inputManager.currentState.mouse.position,
    );

    const distance = cursorPosition.length();

    this.avatar.alpha = animate(distance, 50, 200, 1, 0);
  }

  inputManager!: InputManager;

  protected loadComplete() {
    super.loadComplete();
    this.inputManager = this.getContainingInputManager()!;
  }
}

class UserAvatar extends CompositeDrawable {
  constructor(user: UserSessionInfo) {
    super();

    Assets.load({
      src: `/api/users/${user.id}/avatar`,
      loadParser: 'loadTextures',
    }).then((texture) => {
      if (texture) {
        const sprite = new DrawableSprite({
          texture,
          width: 16,
          height: 16,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        });

        sprite.drawNode.mask = sprite.drawNode.addChild(
          new Graphics().circle(8, 8, 8).fill({ color: 'white' }),
        );

        this.addInternal(sprite);

        this.addInternal(
          new OsucadSpriteText({
            text: user.username,
            color: user.color,
            fontSize: 8,
            fontWeight: 600,
            origin: Anchor.CenterLeft,
            anchor: Anchor.CenterLeft,
            x: 12,
          }),
        );
      }
    });
  }
}
