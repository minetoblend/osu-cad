import gsap from 'gsap';
import {
  dependencyLoader,
  resolved,
} from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { Invalidation } from '../../framework/drawable/Invalidation';
import { RoundedBox } from '../../framework/drawable/RoundedBox';
import { DrawableText } from '../../framework/drawable/SpriteText';
import { MouseDownEvent } from '../../framework/input/events/MouseEvent';
import { EditorClock } from '../EditorClock';
import { TimestampFormatter } from '../utils/TimestampFormatter';
import { MarginPadding } from '@/framework/drawable/MarginPadding.ts';
import { AudioManager } from '@/framework/audio/AudioManager.ts';
import { UISamples } from '@/editor/UISamples.ts';

export class EditorTimestamp extends ContainerDrawable {
  constructor() {
    super({});
  }

  @resolved(EditorClock)
  clock!: EditorClock;

  @dependencyLoader()
  load() {
    this.add(this.background);
    this.add(this.timestamp);
  }

  #lastTimestamp = -1;

  background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    color: 0xffffff,
    alpha: 0,
    cornerRadius: 4,
    margin: new MarginPadding({
      horizontal: -3,
    }),
  });

  timestamp = new DrawableText({
    text: '',
    color: 0xb6b6c3,
    fontSize: 20,
    origin: Anchor.Centre,
    anchor: Anchor.Centre,
  });

  override update(): void {
    super.update();

    const currentTime = this.clock.currentTimeAnimated;
    if (this.#lastTimestamp === currentTime) return;
    this.#lastTimestamp = currentTime;
    this.timestamp.text = TimestampFormatter.formatTimestamp(currentTime);
  }

  override get drawSize() {
    return this.timestamp.drawSize;
  }

  override onHover(): boolean {
    gsap.to(this.background, {
      alpha: 0.1,
      duration: 0.1,
    });
    this.timestamp.color = 0xccccde;
    return false;
  }

  override onHoverLost(): boolean {
    gsap.to(this.background, {
      alpha: 0,
      duration: 0.1,
    });
    this.timestamp.color = 0xb6b6c3;
    gsap.to(this.timestamp.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      onUpdate: () => {
        this.timestamp.invalidate(
          Invalidation.Transform | Invalidation.DrawSize,
        );
      },
    });
    return false;
  }

  override onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      gsap.to(this.timestamp.scale, {
        x: 0.95,
        y: 0.95,
        duration: 0.1,
        onUpdate: () => {
          this.timestamp.invalidate(
            Invalidation.Transform | Invalidation.DrawSize,
          );
        },
      });
      this.dependencies.resolve(AudioManager).playSound(
        {
          buffer: this.dependencies.resolve(UISamples).toolSwitch,
        },
        'ui',
      );
      const text = this.timestamp.text;
      navigator.clipboard.writeText(text);
      // TODO: Add toast
    }

    return true;
  }

  override onMouseUp(): boolean {
    gsap.to(this.timestamp.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      onUpdate: () => {
        this.timestamp.invalidate(
          Invalidation.Transform | Invalidation.DrawSize,
        );
      },
    });
    return true;
  }
}
