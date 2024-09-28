import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';
import { Axes, CompositeDrawable, Container, dependencyLoader, resolved } from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap.ts';
import { LifetimeEntry } from '../../../pooling/LifetimeEntry.ts';
import { LifetimeEntryManager } from '../../../pooling/LifetimeEntryManager.ts';
import { Timeline } from '../../timeline/Timeline.ts';
import { TimelineControlPointDrawable } from './TimelineControlPointDrawable.ts';

export class TimelineControlPointContainer extends CompositeDrawable {
  @resolved(Beatmap)
  beatmap!: Beatmap;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#controlPointContainer);

    this.beatmap.controlPoints.groupAdded.addListener(this.#addGroup, this);
    this.beatmap.controlPoints.groupRemoved.addListener(this.#removeGroup, this);

    this.#lifetimeManager.entryBecameAlive.addListener(this.#entryBecameAlive, this);
    this.#lifetimeManager.entryBecameDead.addListener(this.#entryBecameDead, this);
  }

  #timeline!: Timeline;

  protected loadComplete() {
    super.loadComplete();

    this.#timeline = this.findClosestParentOfType(Timeline)!;

    for (const group of this.beatmap.controlPoints.groups)
      this.#addGroup(group);
  }

  #entries = new Map<ControlPointGroup, ControlPointLifetimeEntry>();

  #addGroup(group: ControlPointGroup) {
    const entry = new ControlPointLifetimeEntry(group);
    this.#lifetimeManager.addEntry(entry);
    this.#entries.set(group, entry);
  }

  #removeGroup(group: ControlPointGroup) {
    const entry = this.#entries.get(group);
    if (entry) {
      this.#lifetimeManager.removeEntry(entry);
      this.#entries.delete(group);
    }
  }

  #controlPointContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  #lifetimeManager = new LifetimeEntryManager();

  #drawables = new Map<ControlPointGroup, TimelineControlPointDrawable>();

  #entryBecameAlive(entry: LifetimeEntry) {
    const controlPointEntry = entry as ControlPointLifetimeEntry;
    const group = controlPointEntry.controlPoint;

    const drawable = new TimelineControlPointDrawable(group);
    this.#controlPointContainer.add(drawable);
    this.#drawables.set(group, drawable);
  }

  #entryBecameDead(entry: LifetimeEntry) {
    const controlPointEntry = entry as ControlPointLifetimeEntry;
    const group = controlPointEntry.controlPoint;

    const drawable = this.#drawables.get(group);
    if (drawable) {
      this.#controlPointContainer.remove(drawable);
      this.#drawables.delete(group);
    }
  }

  update() {
    super.update();

    this.#lifetimeManager.update(this.#timeline.startTime, this.#timeline.endTime);
  }
}

class ControlPointLifetimeEntry extends LifetimeEntry {
  constructor(public controlPoint: ControlPointGroup) {
    super();
    this.updateLifetime();
    this.controlPoint.changed.addListener(this.updateLifetime, this);
  }

  protected updateLifetime() {
    this.lifetimeStart = this.lifetimeEnd = this.controlPoint.time;
  }
}
