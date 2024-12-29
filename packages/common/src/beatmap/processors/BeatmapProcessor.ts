import type { HitObject } from '../../hitObjects/HitObject';
import { Cached, Component, resolved } from 'osucad-framework';
import { IBeatmap } from '../IBeatmap';

export abstract class BeatmapProcessor extends Component {
  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  protected get hitObjects() {
    return this.beatmap.hitObjects;
  }

  protected readonly state = new Cached();

  protected override loadComplete() {
    super.loadComplete();

    this.hitObjects.added.addListener(h => this.onHitObjectAdded(h));
    this.hitObjects.removed.addListener(h => this.onHitObjectRemoved(h));

    for (const h of this.hitObjects) {
      this.onHitObjectAdded(h);
    }

    this.processBeatmap();
    this.state.validate();
  }

  onHitObjectAdded(hitObject: HitObject) {
    this.state.invalidate();
  }

  onHitObjectRemoved(hitObject: HitObject) {
    this.state.invalidate();
  }

  override update() {
    super.update();

    if (!this.state.isValid) {
      this.processBeatmap();
      this.state.validate();
    }
  }

  protected abstract processBeatmap(): void;
}
