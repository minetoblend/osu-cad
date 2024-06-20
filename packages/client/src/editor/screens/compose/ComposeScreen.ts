import { dependencyLoader } from '../../../framework/di/DependencyLoader';
import { Invalidation } from '../../../framework/drawable/Invalidation';
import { MarginPadding } from '../../../framework/drawable/MarginPadding';
import { PlayfieldContainer } from '../../PlayfieldContainer';
import { EditorScreen } from '../EditorScreen';
import gsap from 'gsap';
import { ComposeToolbar } from './ComposeToolbar';
import { Axes } from '../../../framework/drawable/Axes';
import { ComposeTogglesBar } from './ComposeTogglesBar.ts';
import { Anchor } from '../../../framework/drawable/Anchor.ts';

export class ComposeScreen extends EditorScreen {
  playfield!: PlayfieldContainer;

  @dependencyLoader()
  load() {
    this.playfield = this.add(
      new PlayfieldContainer({
        margin: this.playfieldMargin,
      }),
    );
    this.add(
      new ComposeToolbar({
        width: 48,
        relativeSizeAxes: Axes.Y,
        margin: new MarginPadding({
          horizontal: 8,
          vertical: 10,
        }),
      }),
    );
    this.add(
      new ComposeTogglesBar({
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        width: 48,
        relativeSizeAxes: Axes.Y,
        margin: new MarginPadding({
          horizontal: 8,
          vertical: 10,
        }),
      }),
    );
  }

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
}
