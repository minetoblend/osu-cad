import type { BeatmapInfo } from '@osucad/common';
import type { ClickEvent } from 'osucad-framework';
import { Anchor, Axes, Container, MouseButton, RoundedBox, ScreenStack, dependencyLoader } from 'osucad-framework';

import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorLoader } from '../editor/EditorLoader';
import { OnlineEditorContext } from '../editor/context/OnlineEditorContext';
import { BeatmapCover } from './BeatmapCover';
import { CAROUSEL_ITEM_HEIGHT } from './constants';
import { BeatmapVersionBadge } from './BeatmapVersionBadge';
import { UserWithAvatar } from './UserWithAvatar';

export class BeatmapCarouselItem extends Container {
  constructor(readonly beatmap: BeatmapInfo) {
    super({
      relativeSizeAxes: Axes.X,
      height: CAROUSEL_ITEM_HEIGHT,
    });
  }

  #background!: RoundedBox;

  #cover!: BeatmapCover;

  backgroundColor = 0x282832;

  backgroundColorHover = 0x383842;

  #content!: Container;

  @dependencyLoader()
  load() {
    this.addInternal(this.#background = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 4,
      color: 0x282832,
    }));

    this.addAllInternal(
      this.#cover = new BeatmapCover(this.beatmap),
    );

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      padding: { left: CAROUSEL_ITEM_HEIGHT + 6, top: 6, right: 6, bottom: 6 },
    }));

    this.addAll(
      new OsucadSpriteText({
        text: this.beatmap.title,
        fontSize: 12,
      }),
      new OsucadSpriteText({
        text: this.beatmap.artist,
        fontSize: 11,
        alpha: 0.8,
        y: 16,
      }),
      new BeatmapVersionBadge(this.beatmap.version).apply({
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
      new UserWithAvatar(this.beatmap.creator).apply({
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
    );
  }

  get content() {
    return this.#content;
  }

  onHover(): boolean {
    this.#background.color = this.backgroundColorHover;

    return true;
  }

  onHoverLost(): boolean {
    this.#background.color = this.backgroundColor;

    return true;
  }

  onClick(e: ClickEvent): boolean {
    if (e.button === MouseButton.Left) {
      const joinKey = this.beatmap.links.edit.split('/').pop()!;

      this.findClosestParentOfType(ScreenStack)
        ?.push(new EditorLoader(
          new OnlineEditorContext(joinKey),
          this.#cover,
        ));

      return true;
    }

    return false;
  }
}
