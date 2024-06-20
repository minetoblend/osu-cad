import { Axes } from '../../../framework/drawable/Axes';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../../framework/drawable/ContainerDrawable';
import { VBox } from '../../../framework/drawable/VBox';
import { ToolbarButton } from './ToolbarButton';
import { Vec2 } from '@osucad/common';
import { isMobile } from '@/utils';

export class ComposeTogglesBar extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);
    if (isMobile()) {
      this.scale = new Vec2(1.3);
    }

    this.add(
      new VBox({
        relativeSizeAxes: Axes.X,
        gap: 4,
        children: [
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '1',
            icon: '/assets/icons/new combo.png',
            onClick: () => {},
          }),
          new ContainerDrawable({
            height: 12,
          }),
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '1',
            icon: '/assets/icons/whistle.png',
            onClick: () => {},
          }),
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '1',
            icon: '/assets/icons/finish.png',
            onClick: () => {},
          }),
        ],
      }),
    );
  }
}
