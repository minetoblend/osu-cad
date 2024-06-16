import { dependencyLoader, resolved } from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { DrawableText } from '../../framework/drawable/SpriteText';
import { EditorClock } from '../EditorClock';
import { EditorTimestamp } from './EditorTimestamp';

export class EditorTimestampContainer extends ContainerDrawable {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  timestamp = new EditorTimestamp();

  bpm = new DrawableText({
    text: '180bpm',
    color: 0x32d2ac,
    fontSize: 12,
    anchor: Anchor.BottomLeft,
    origin: Anchor.BottomLeft,
    fontFamily: 'nunito-sans-600',
  });

  @resolved(EditorClock)
  clock!: EditorClock;

  @dependencyLoader()
  load() {
    this.add(this.timestamp);
    this.add(this.bpm);
  }
}
