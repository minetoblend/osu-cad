import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';

import type { UserInfo } from '@osucad/common';
import type { Texture } from 'pixi.js';
import { Graphics, Matrix } from 'pixi.js';

import { UserAvatarCache } from '../UserAvatarCache';
import { OsucadSpriteText } from '../OsucadSpriteText';

function createRoundAvatar(
  texture: Texture,
  radius: number,
) {
  return new Graphics()
    .circle(radius, radius, radius)
    .fill({
      texture,
      matrix: new Matrix()
        .scale(
          2 * radius / texture.width,
          2 * radius / texture.height,
        ),
    });
}

export class UserWithAvatar extends CompositeDrawable {
  constructor(readonly user: UserInfo) {
    super();

    this.autoSizeAxes = Axes.Both;
  }

  @resolved(UserAvatarCache)
  avatarCache!: UserAvatarCache;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new OsucadSpriteText({
        text: this.user.username,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        x: -30,
        fontSize: 16,
        alpha: 0.8,
      }),
      this.#avatarContainer = new Container({
        width: 25,
        height: 25,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        child: new RoundedBox({
          relativeSizeAxes: Axes.Both,
          color: 0x373744,
          cornerRadius: 15,
        }),
      }),
    );

    this.#avatarContainer.onLoadComplete.addListener(() => {
      this.avatarCache.getAvatar(this.user.id)
        .then((texture) => {
          if (texture) {
            if (this.isDisposed) {
              texture.destroy();

              return;
            }

            const avatar = createRoundAvatar(
              texture,
              15,
            );

            this.#avatarContainer.drawNode.addChild(avatar);

            this.onDispose(() => texture.destroy());
          }
        });
    });
  }

  #avatarContainer!: Container;
}
