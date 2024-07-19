import type {
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Container,
  FillDirection,
  FillFlowContainer,
  MouseButton,
  RoundedBox,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';

import type { UserSessionInfo } from '@osucad/common';
import { Color } from 'pixi.js';
import gsap from 'gsap';
import { ConnectedUsersManager } from '../context/ConnectedUsersManager';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { UISamples } from '../../UISamples';
import { UserAvatarCache } from '../../UserAvatarCache';

export class ConnectedUsersOverlay extends Container {
  @resolved(ConnectedUsersManager)
  private users!: ConnectedUsersManager;

  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 24,
      padding: { right: 16 },
    });
  }

  #items = new FillFlowContainer({
    direction: FillDirection.Horizontal,
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    spacing: new Vec2(8),
    layoutDuration: 500,
    layoutEasing: 'back.out',
    anchor: Anchor.BottomRight,
    origin: Anchor.BottomRight,
    y: -20,
  });

  get content() {
    return this.#items;
  }

  @resolved(UISamples)
  private samples!: UISamples;

  #avatarMap = new Map<number, UserAvatar>();

  count = 0;

  @dependencyLoader()
  load() {
    this.addAllInternal(this.#items, this.#textFlow);

    for (const user of this.users.users) {
      const avatar = new UserAvatar(user);
      this.#items.insert(this.count--, avatar);
      this.#avatarMap.set(user.sessionId, avatar);
    }

    this.users.userJoined.addListener((user) => {
      const avatar = new UserAvatar(user);
      avatar.x = 20;
      avatar.rotation = Math.PI / 2;

      avatar.rotateTo({ rotation: 0, duration: 500, easing: 'back.out' });

      this.#items.insert(this.count--, avatar);
      this.#avatarMap.set(user.sessionId, avatar);

      this.showText(`${user.username} joined`, user.color);

      this.samples.userJoined.play();
    });

    this.users.userLeft.addListener((user) => {
      const avatar = this.#avatarMap.get(user.sessionId);
      if (avatar) {
        this.#items.remove(avatar);
        this.#avatarMap.delete(user.sessionId);
        this.showText(`${user.username} left`, user.color);

        this.samples.userLeft.play();
      }
    });
  }

  #textFlow = new FillFlowContainer({
    direction: FillDirection.Vertical,
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    spacing: new Vec2(4),
    layoutDuration: 200,
    layoutEasing: 'power3.out',
    anchor: Anchor.BottomRight,
    origin: Anchor.BottomRight,
    y: -40,
    x: 16,
  });

  showText(text: string, color: string) {
    const drawable = new OsucadSpriteText({
      text,
      fontSize: 14,
      color,
      anchor: Anchor.BottomRight,
      origin: Anchor.BottomRight,
    });

    const container = new Container({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      child: drawable,
      anchor: Anchor.BottomRight,
      origin: Anchor.BottomRight,
    });
    drawable.blendMode = 'add';

    this.#textFlow.insert(--this.count, container);

    gsap.from(drawable, {
      x: 50,
      alpha: 0,
      duration: 0.3,
      ease: 'power3.out',
    });

    this.scheduler.addDelayed(() => {
      gsap.to(drawable, {
        x: 25,
        alpha: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          this.#textFlow.remove(container);
        },
      });
    }, 5000);
  }
}

class UserAvatar extends Container {
  constructor(readonly user: UserSessionInfo) {
    super({
      width: 28,
      height: 28,
    });

    this.anchor = Anchor.BottomRight;
    this.origin = Anchor.Center;
  }

  @resolved(UserAvatarCache)
  userAvatars!: UserAvatarCache;

  @dependencyLoader()
  load() {
    this.userAvatars.getAvatar(this.user.id).then((texture) => {
      if (!texture)
        return;

      const avatar = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 14,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        texture,
      });

      this.onDispose(() => texture.destroy());

      this.add(this.#avatar = avatar);

      this.add(this.#ring = new RoundedBox({
        width: 32,
        height: 32,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 16,
        fillAlpha: 0,
        outline: {
          width: 1,
          color: Color.shared.setValue(this.user.color).toNumber(),
          alpha: 1,
          alignment: 1,
        },
      }));

      this.add(this.#username = new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 4, vertical: 2 },
        anchor: Anchor.TopRight,
        origin: Anchor.BottomRight,
        y: -4,
        alpha: 0,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 4,
            alpha: 0.5,
            color: 0x222228,
          }),
          new OsucadSpriteText({
            text: this.user.username,
            fontSize: 12,
            color: 0xB6B6C3,
          }),
        ],
      }));
    });
  }

  #username!: Container;

  #avatar!: RoundedBox;

  #ring!: RoundedBox;

  onHover(): boolean {
    this.#username.fadeIn({ duration: 200 });

    return true;
  }

  onHoverLost(): boolean {
    this.#username.fadeOut({ duration: 200 });

    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      gsap.to(this.#ring, {
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 0.1,
        ease: 'power3.out',
      });

      gsap.to(this.#avatar, {
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 0.1,
        ease: 'power3.out',
      });

      return true;
    }

    return false;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      gsap.to(this.#ring, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        ease: 'back.out',
      });

      gsap.to(this.#avatar, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        ease: 'back.out',
      });

      return true;
    }

    return false;
  }
}
