import type { Graphics } from 'pixi.js';
import { Anchor, Axes, Bindable, dependencyLoader, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../beatmap/hitObjects/HitObjectList';
import { GraphicsDrawable } from '../../../drawables/GraphicsDrawable';
import { EditorDifficultyManager } from '../../difficulty/EditorDifficultyManager';
import { EditorClock } from '../../EditorClock';

export class StrainGraph extends GraphicsDrawable {
  @resolved(EditorDifficultyManager)
  difficultyManager!: EditorDifficultyManager;

  readonly strains = new Bindable<number[][] | null>(null);

  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.anchor = Anchor.TopLeft;
    this.origin = Anchor.BottomLeft;
    this.height = 30;
  }

  @resolved(HitObjectList)
  hitobjects!: HitObjectList;

  @dependencyLoader()
  load() {
    this.strains.bindTo(this.difficultyManager.strains);

    this.strains.addOnChangeListener(() => this.invalidateGraphics());
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  updateGraphics(g: Graphics): void {
    g.clear();

    if (!this.strains.value)
      return;

    const strains = this.strains.value[0];
    if (!strains || strains.length <= 1)
      return;

    const height = this.drawHeight;

    const increment = 400 / this.editorClock.trackLength * this.drawWidth;

    const maxStrain = strains.reduce((a, b) => Math.max(a, b), 0);

    let offset = 0.5;
    if (this.hitobjects.length > 0)
      offset += Math.floor(this.hitobjects.first!.startTime / 400);

    for (let i = 0; i < strains.length; i++) {
      const relativeStrain = strains[i] / maxStrain;

      g.rect((i + offset) * increment, (1 - relativeStrain) * height, increment, relativeStrain * height);
    }

    g.fill({
      color: 0xFFFFFF,
      alpha: 0.5,
    });
  }
}
