import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../framework/drawable/ContainerDrawable';
import { Axes } from '@/framework/drawable/Axes.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { EditorProgressBar } from './EditorProgressBar.ts';

export class OverviewTimeline extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);

    this.add(
      new EditorProgressBar({
        relativeSizeAxes: Axes.X,
        anchor: Anchor.CentreLeft,
        origin: Anchor.CentreLeft,
      }),
    );
  }
}
