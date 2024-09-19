import type { Additions } from '../hitSounds/Additions.ts';
import type { HitObjectPatch } from '../serialization/HitObjects.ts';
import type { Slider } from './Slider.ts';
import { Action } from 'osucad-framework';
import { SampleSet } from '../hitSounds/SampleSet.ts';

export enum SliderSelectionType {
  Body = 1,
  Start = 2,
  End = 3,
  Head = 4,
  Tail = 5,
  Custom = 6,

  None = 0,
}

export class SliderSelection {
  constructor(readonly slider: Slider) {
  }

  readonly changed = new Action<SliderSelection>();

  #type = SliderSelectionType.None;

  #selectedEdges: Set<number> = new Set();

  get bodySelected() {
    return this.#type === SliderSelectionType.Body || this.#type === SliderSelectionType.None;
  }

  get selectedEdges() {
    return this.#selectedEdges;
  }

  get edgesSelected() {
    return this.#selectedEdges.size > 0;
  }

  update() {
    switch (this.#type) {
      case SliderSelectionType.None:
        this.#selectedEdges.clear();
        for (let i = 0; i <= this.slider.repeatCount + 1; i++) {
          this.#selectedEdges.add(i);
        }
        break;
      case SliderSelectionType.Body:
        this.#selectedEdges.clear();
        break;
      case SliderSelectionType.Start:
        this.#selectStart();
        break;
      case SliderSelectionType.End:
        this.#selectEnd();
        break;
      case SliderSelectionType.Head:
        this.#selectHead();
        break;
      case SliderSelectionType.Tail:
        this.#selectTail();
        break;
      case SliderSelectionType.Custom:
        this.#selectedEdges = new Set([...this.#selectedEdges].filter(it => it <= this.slider.repeatCount + 1));
        break;
    }
    this.changed.emit(this);
  }

  #selectStart() {
    this.#selectedEdges = new Set([0]);
    this.changed.emit(this);
  }

  #selectEnd() {
    this.#selectedEdges = new Set([this.slider.repeatCount + 1]);
    this.changed.emit(this);
  }

  #selectHead() {
    const edges = new Set<number>();
    for (let i = 0; i <= this.slider.repeatCount + 1; i += 2)
      edges.add(i);

    this.#selectedEdges = edges;

    this.changed.emit(this);
  }

  #selectTail() {
    const edges = new Set<number>();
    for (let i = 1; i <= this.slider.repeatCount + 1; i += 2)
      edges.add(i);

    this.#selectedEdges = edges;

    this.changed.emit(this);
  }

  #setType(type: SliderSelectionType) {
    if (this.#type === type) return;

    this.#type = type;
    this.update();
  }

  get anyHeadSelected() {
    if (this.bodySelected) return false;

    for (const edge of this.#selectedEdges) {
      if (edge % 2 === 0) return true;
    }

    return false;
  }

  get anyTailSelected() {
    if (this.bodySelected) return false;

    for (const edge of this.#selectedEdges) {
      if (edge % 2 === 1) return true;
    }

    return false;
  }

  get startSelected() {
    return !this.bodySelected && this.#selectedEdges.has(0);
  }

  get endSelected() {
    return !this.bodySelected && this.#selectedEdges.has(this.slider.repeatCount + 1);
  }

  clear() {
    this.#setType(SliderSelectionType.None);
  }

  select(type: SliderSelectionType, edges?: number[]) {
    if (type === SliderSelectionType.Custom) {
      if (edges === undefined)
        throw new Error('Custom selection requires edges');

      if (edges.length === 0) {
        this.select(SliderSelectionType.None);
        return;
      }

      if (edges.length === 1 && edges[0] === 0) {
        this.select(SliderSelectionType.Start);
        return;
      }

      if (edges.length === 1 && edges[0] === this.slider.repeatCount + 1) {
        this.select(SliderSelectionType.End);
        return;
      }

      this.#type = SliderSelectionType.Custom;
      this.#selectedEdges = new Set(edges);
      this.update();
      return;
    }

    this.#setType(type);
  }

  getCombinedSampleSet(type: 'sampleSet' | 'additionSampleSet' = 'sampleSet') {
    if (this.bodySelected)
      return this.slider.hitSound[type];

    console.assert(this.#selectedEdges.size > 0);

    return [...this.#selectedEdges]
      .map(edge => this.slider.hitSounds[edge][type])
      .reduce((a, b) => a === b ? a : SampleSet.Auto);
  }

  getCombinedAdditions() {
    if (this.bodySelected)
      return this.slider.hitSound.additions;

    console.assert(this.#selectedEdges.size > 0);

    return [...this.#selectedEdges]
      .map(edge => this.slider.hitSounds[edge].additions)
      .reduce((a, b) => a & b);
  }

  get type() {
    return this.#type;
  }

  createSampleSetPatch(sampleSet: SampleSet): HitObjectPatch<Slider> | null {
    let didUpdate = false;
    const patch: HitObjectPatch<Slider> = {};

    if (this.#type === SliderSelectionType.None || this.#type === SliderSelectionType.Body) {
      if (this.slider.hitSound.sampleSet !== sampleSet) {
        patch.hitSound = this.slider.hitSound.withSampleSet(sampleSet);
        didUpdate = true;
      }
    }

    for (const edge of this.#selectedEdges) {
      if (this.slider.hitSounds[edge].sampleSet !== sampleSet) {
        patch.hitSounds = this.slider.hitSounds.map((h, index) => this.#selectedEdges.has(index) ? h.withSampleSet(sampleSet) : h);
        didUpdate = true;
        break;
      }
    }

    return didUpdate ? patch : null;
  }

  createAdditionSampleSetPatch(additionSampleSet: SampleSet): HitObjectPatch<Slider> | null {
    let didUpdate = false;
    const patch: HitObjectPatch<Slider> = {};

    if (this.#type === SliderSelectionType.None || this.#type === SliderSelectionType.Body) {
      if (this.slider.hitSound.additionSampleSet !== additionSampleSet) {
        patch.hitSound = this.slider.hitSound.withAdditionSampleSet(additionSampleSet);
        didUpdate = true;
      }
    }

    for (const edge of this.#selectedEdges) {
      if (this.slider.hitSounds[edge].additionSampleSet !== additionSampleSet) {
        patch.hitSounds = this.slider.hitSounds.map((h, index) => this.#selectedEdges.has(index) ? h.withAdditionSampleSet(additionSampleSet) : h);
        didUpdate = true;
        break;
      }
    }

    return didUpdate ? patch : null;
  }

  createAdditionsPatch(additions: Additions, changed: Additions): HitObjectPatch<Slider> | null {
    let didUpdate = false;
    const patch: HitObjectPatch<Slider> = {};

    console.log({ additions, changed })

    function applyChange(value: Additions) {
      return (value & ~changed) | (additions & changed);
    }

    if (this.#type === SliderSelectionType.None || this.#type === SliderSelectionType.Body) {
      const newAdditions = applyChange(additions);

      if (this.slider.hitSound.additions !== newAdditions) {
        patch.hitSound = this.slider.hitSound.withAdditions(applyChange(additions));
        didUpdate = true;
      }
    }

    for (const edge of this.#selectedEdges) {
      const newAdditions = applyChange(this.slider.hitSounds[edge].additions);

      if (newAdditions !== this.slider.hitSounds[edge].additions) {
        patch.hitSounds = this.slider.hitSounds.map((h, index) =>
          this.#selectedEdges.has(index)
            ? h.withAdditions(applyChange(this.slider.hitSounds[index].additions))
            : h,
        );

        didUpdate = true;
        break;
      }
    }

    return didUpdate ? patch : null;
  }
}
