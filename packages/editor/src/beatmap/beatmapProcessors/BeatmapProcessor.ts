import { Cached, Component, resolved } from 'osucad-framework';
import { Beatmap } from '../Beatmap';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';

export abstract class BeatmapProcessor extends Component {
  @resolved(Beatmap)
  protected beatmap!: Beatmap;

  protected get hitObjects() {
    return this.beatmap.hitObjects;
  }

  protected readonly state = new Cached();

  protected loadComplete() {
    super.loadComplete();

    this.hitObjects.added.addListener(h => this.onHitObjectAdded(h));
    this.hitObjects.removed.addListener(h => this.onHitObjectRemoved(h));

    for (const h of this.hitObjects) {
      this.onHitObjectAdded(h);
    }

    this.processBeatmap();
    this.state.validate();
  }

  onHitObjectAdded(hitObject: OsuHitObject) {
    this.state.invalidate();
  }

  onHitObjectRemoved(hitObject: OsuHitObject) {
    this.state.invalidate();
  }

  update() {
    super.update();

    if (!this.state.isValid) {
      this.processBeatmap();
      this.state.validate();
    }
  }

  protected abstract processBeatmap(): void;
}
