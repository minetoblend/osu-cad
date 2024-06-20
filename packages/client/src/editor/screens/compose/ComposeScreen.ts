import { dependencyLoader, resolved } from '../../../framework/di/DependencyLoader';
import { Invalidation } from '../../../framework/drawable/Invalidation';
import { MarginPadding } from '../../../framework/drawable/MarginPadding';
import { PlayfieldContainer } from '../../PlayfieldContainer';
import { EditorScreen } from '../EditorScreen';
import gsap from 'gsap';
import { ComposeToolbar } from './ComposeToolbar';
import { Axes } from '../../../framework/drawable/Axes';
import { Anchor } from '@/framework/drawable/Anchor';
import { BeatmapBackground } from '@/editor/BeatmapBackground';

export class ComposeScreen extends EditorScreen {
  playfield!: PlayfieldContainer;

  @dependencyLoader()
  load() {
    this.playfield = this.add(
      new PlayfieldContainer({
        margin: this.playfieldMargin,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
      }),
    );
    this.toolbar = this.add(
      new ComposeToolbar({
        width: 48,
        relativeSizeAxes: Axes.Y,
        margin: new MarginPadding({
          horizontal: 8,
          vertical: 10,
        }),
      }),
    );
  }

  toolbar!: ComposeToolbar;

  get playfieldMargin() {
    if (this.drawSize.x <= 1120) {
      return new MarginPadding({
        top: 15,
        bottom: 15,
        horizontal: 84,
      });
    }
    if (this.drawSize.x <= 1290) {
      return new MarginPadding({
        top: 15,
        bottom: 0,
        horizontal: 64,
      });
    } else {
      return new MarginPadding({
        top: 0,
        bottom: 0,
        horizontal: 64,
      });
    }
  }

  override handleInvalidations(): void {
    super.handleInvalidations();

    if (this._invalidations & Invalidation.DrawSize) {
      if (this.playfield) {
        gsap.to(this.playfield.margin, {
          ...this.playfieldMargin,
          duration: 0.3,
          ease: 'power2.out',
          onUpdate: () =>
            this.playfield.invalidate(
              Invalidation.DrawSize | Invalidation.Transform,
            ),
        });
      }
    }
  }

  @resolved(BeatmapBackground)
  background!: BeatmapBackground;

  show() {
    this.toolbar.appear();
    gsap.from(this.playfield, {
      alpha: 0,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.4,
      ease: 'power2.out',
    })
    gsap.to(this.background, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  hide(done: () => void): void {
    gsap.to(this, {
      alpha: 0,
      duration: 0.4,
      onComplete: done,
    });
    gsap.to(this.playfield, {
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: done,
    });
    this.toolbar.hide();
  }
}
