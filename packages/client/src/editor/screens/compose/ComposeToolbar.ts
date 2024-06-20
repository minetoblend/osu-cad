import { Axes } from '../../../framework/drawable/Axes';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../../framework/drawable/ContainerDrawable';
import { VBox } from '../../../framework/drawable/VBox';
import { ToolbarButton } from './ToolbarButton';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import { AudioManager } from '@/framework/audio/AudioManager.ts';
import { UISamples } from '@/editor/UISamples.ts';
import { Vec2 } from '@osucad/common';
import { isMobile } from '@/utils';
import { Anchor } from '@/framework/drawable/Anchor';
import { CustomBackdropBlur } from '@/editor/filters/CustomBackdropBlur';

export class ComposeToolbar extends ContainerDrawable {
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
            icon: '/src/assets/icons/select.png',
            onClick: () => (this.activeTool = 0),
          }),
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '2',
            icon: '/src/assets/icons/circle.png',
            onClick: () => (this.activeTool = 1),
          }),
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '3',
            icon: '/src/assets/icons/slider.png',
            onClick: () => (this.activeTool = 2),
          }),
          new ToolbarButton({
            width: 48,
            height: 48,
            key: '4',
            icon: '/src/assets/icons/spinner.png',
            onClick: () => (this.activeTool = 3),
          }),
        ],
      }),
    );
    this.add(
      new ToolbarButton({
        width: 48,
        height: 48,
        key: '5',
        icon: '/src/assets/icons/grid.png',
        onClick: () => {},
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
    );

    this.drawNode.filters = [
      new CustomBackdropBlur({
        quality: 2,
        strength: 5,
        antialias: 'inherit',
        resolution: devicePixelRatio,
      }),
    ]

    this.updateState();
  }

  #activeTool = 0;

  get activeTool() {
    return this.#activeTool;
  }

  set activeTool(value: number) {
    if (value === this.#activeTool) return;
    this.#activeTool = value;
    this.updateState();
    this.audioManager.playSound(
      {
        buffer: this.uiSamples.toolSwitch,
      },
      'ui',
    );
  }

  updateState() {
    const children = (this.children[0] as VBox).children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as ToolbarButton;
      child.active = i === this.#activeTool;
    }
  }

  receiveGlobalKeyboardEvents(): boolean {
    return true;
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(UISamples)
  uiSamples!: UISamples;
}
