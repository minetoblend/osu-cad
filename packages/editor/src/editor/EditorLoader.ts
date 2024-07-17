import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box, DrawableSprite, FillMode, ScreenStack } from 'osucad-framework';
import gsap from 'gsap';
import { BlurFilter } from 'pixi.js';
import { OsucadScreen } from '../OsucadScreen';
import type { BeatmapCover } from '../beatmapSelect/BeatmapCover';
import type { EditorContext } from './context/EditorContext';
import { OnlineEditorContext } from './context/OnlineEditorContext';

export class EditorLoader extends OsucadScreen {
  constructor(
    readonly context: EditorContext,
    readonly cover?: BeatmapCover,
  ) {
    super();

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 'black',
    }));
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    // this.y = 200;
    this.fadeIn({ duration: 300, easing: 'power3.out' });
    // this.moveTo({ y: 0, duration: 600, easing: 'expo.out' });

    if (this.cover) {
      if (this.cover.background) {
        const background = new DrawableSprite({
          texture: this.cover.background.texture,
          relativeSizeAxes: Axes.Both,
          alpha: 0.25,
          width: 0.8,
          height: 0.8,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        });

        gsap.to(background, {
          width: 1,
          height: 1,
          duration: 0.6,
          ease: 'expo.out',
        });

        background.fillAspectRatio = this.cover.background.fillAspectRatio;
        background.fillMode = FillMode.Fill;

        background.filters = [
          new BlurFilter({
            strength: 30,
            quality: 5,
          }),
        ];

        this.addInternal(background);
      }
    }

    const screenStack = this.findClosestParentOfType(ScreenStack);
    if (!screenStack) {
      throw new Error('EditorLoader must be a child of a ScreenStack');
    }

    import('./Editor').then(({ Editor }) => {
      this.screenStack.push(new Editor(this.context));
    });
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.exit();
  }

  getPath(): string {
    if (this.context instanceof OnlineEditorContext) {
      return `/edit/${this.context.joinKey}`;
    }

    return '/edit';
  }
}
