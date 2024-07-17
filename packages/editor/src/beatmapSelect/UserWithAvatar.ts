import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  DrawableSprite,
  FillMode,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { UserInfo } from '@osucad/common';
import { Graphics } from 'pixi.js';
import { UserAvatarCache } from '../UserAvatarCache';
import { OsucadSpriteText } from '../OsucadSpriteText';

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

    this.avatarCache.getAvatar(this.user.id).then((texture) => {
      if (texture) {
        const sprite = new DrawableSprite({
          texture,
          relativeSizeAxes: Axes.Both,

        });

        sprite.fillMode = FillMode.Fill;

        this.#avatarContainer.add(sprite);

        sprite.drawNode.mask = sprite.drawNode.addChild(
          new Graphics()
            .circle(10, 10, 10)
            .fill(),
        );
      }
    });
  }

  #avatarContainer!: Container;
}
