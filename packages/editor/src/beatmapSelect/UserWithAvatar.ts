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
        x: -24,
        fontSize: 11,
      }),
      this.#avatarContainer = new Container({
        width: 20,
        height: 20,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        child: new RoundedBox({
          relativeSizeAxes: Axes.Both,
          color: 0x373744,
          cornerRadius: 10,
        }),
      }),
    );

    this.#avatarContainer.onLoadComplete.addListener(() => {
      this.avatarCache.getAvatar(this.user.id)
        .then((texture) => {
          if (texture) {
            const avatar = createRoundAvatar(
              texture,
              10,
            );

            this.#avatarContainer.drawNode.addChild(avatar);
          }
        });
    });
  }

  #avatarContainer!: Container;
}
