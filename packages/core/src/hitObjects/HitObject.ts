import type { ValueChangedEvent } from '@osucad/framework';
import type { SharedProperty } from '@osucad/multiplayer';
import type { ClassSerialDescriptorBuilder, CompositeDecoder, CompositeEncoder, Decoder, Encoder, SerialDescriptor, Serializer } from '@osucad/serialization';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { Constructor } from '../utils/Constructor';
import { Action, Comparer, Lazy, SortedList } from '@osucad/framework';
import { SharedObject } from '@osucad/multiplayer';
import { buildClassSerialDescriptor, Float32Serializer, SealedClassSerializer } from '@osucad/serialization';
import { Judgement } from '../rulesets/judgements/Judgement';
import { HitResult } from './HitResult';
import { HitWindows } from './HitWindows';
import { hasComboInformation } from './IHasComboInformation';

export abstract class HitObject extends SharedObject {
  static readonly control_point_leniency = 1;

  static readonly COMPARER = new class extends Comparer<HitObject> {
    compare(a: HitObject, b: HitObject) {
      const difference = a.startTime - b.startTime;

      if (difference === 0) {
        return (
          (a.transient ? 1 : 0) - (b.transient ? 1 : 0)
        );
      }

      return difference;
    }
  }();

  readonly needsDefaultsApplied = new Action<HitObject>();

  protected requestApplyDefaults() {
    this.needsDefaultsApplied.emit(this);
  }

  constructor() {
    super();

    this.#startTime = this.property('startTime', 0);
  }

  timePreempt = 600;

  timeFadeIn = 400;

  transient = false;

  readonly defaultsApplied = new Action<HitObject>();

  readonly #startTime: SharedProperty<number>;

  get startTimeBindable() {
    return this.#startTime.bindable;
  }

  get startTime() {
    return this.#startTime.value;
  }

  set startTime(value: number) {
    this.#startTime.value = value;
  }

  get duration() {
    return 0;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  #nestedHitObjects = new SortedList<HitObject>(HitObject.COMPARER);

  get nestedHitObjects(): ReadonlyArray<HitObject> {
    return this.#nestedHitObjects.items;
  }

  applyDefaults(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    this.applyDefaultsToSelf(controlPointInfo, difficulty);

    this.#nestedHitObjects.clear();

    this.createNestedHitObjects();
    if (hasComboInformation(this)) {
      for (const h of this.nestedHitObjects) {
        if (hasComboInformation(h)) {
          h.comboIndexBindable.bindTo(this.comboIndexBindable);
          h.indexInComboBindable.bindTo(this.indexInComboBindable);
        }
      }
    }

    for (const h of this.nestedHitObjects)
      h.applyDefaults(controlPointInfo, difficulty);

    this.startTimeBindable.valueChanged.removeListener(this.onStartTimeChanged, this);

    this.startTimeBindable.valueChanged.addListener(this.onStartTimeChanged, this);

    this.defaultsApplied.emit(this);
  }

  #kiai = false;

  get kiai() {
    return this.#kiai;
  }

  hitWindows!: HitWindows;

  protected applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    this.#kiai = controlPointInfo.effectPointAt(this.startTime + HitObject.control_point_leniency).kiaiMode;

    this.hitWindows ??= this.createHitWindows();
    this.hitWindows.setDifficulty(difficulty.overallDifficulty);
  }

  protected createHitWindows() {
    return new HitWindows();
  }

  protected createNestedHitObjects() {
  }

  addNested(hitObject: HitObject) {
    this.#nestedHitObjects.add(hitObject);
  }

  protected onStartTimeChanged(time: ValueChangedEvent<number>) {
    const offset = time.value - time.previousValue;

    for (const nested of this.nestedHitObjects)
      nested.startTime += offset;

    this.requestApplyDefaults();
  }

  changed = new Action<HitObjectChangeEvent>();

  abstract isVisibleAtTime(time: number): boolean;

  isSelected = false;

  #judgement?: Judgement;

  get judgement(): Judgement {
    this.#judgement ??= this.createJudgement();
    return this.#judgement;
  }

  createJudgement() {
    return new Judgement();
  }

  get maximumJudgementOffset() {
    return this.hitWindows?.windowFor(HitResult.Miss) ?? 0;
  };
}

export interface HitObjectChangeEvent {
  hitObject: HitObject;
  propertyName: string;
}

export abstract class HitObjectSerializer<T extends HitObject> implements Serializer<T> {
  protected constructor(serialName: string) {
    this.#descriptor = new Lazy(() => buildClassSerialDescriptor(serialName, (builder) => {
      this.buildDescriptor(builder);
    }));
  }

  get descriptor() {
    return this.#descriptor.value;
  }

  readonly #descriptor: Lazy<SerialDescriptor>;

  protected buildDescriptor(builder: ClassSerialDescriptorBuilder) {
    const { element } = builder;

    element('startTime', Float32Serializer.descriptor);
  }

  deserialize(decoder: Decoder): T {
    const object = this.createInstance();

    decoder.decodeStructure(this.descriptor, (decoder) => {
      this.deserializeProperties(decoder, object);
    });

    return object;
  }

  serialize(encoder: Encoder, value: T): void {
    encoder.encodeStructure(this.descriptor, (encoder) => {
      this.serializeProperties(encoder, value);
    });
  }

  protected abstract createInstance(): T;

  protected deserializeProperties(decoder: CompositeDecoder, object: T) {
    object.startTime = decoder.decodeFloat64Element(this.descriptor, 0);
  }

  protected serializeProperties(encoder: CompositeEncoder, object: T) {
    encoder.encodeFloat64Element(this.descriptor, 0, object.startTime);
  }
}

export const polymorphicHitObjectSerializers = new Map<Constructor<HitObject>, Serializer<HitObject>>();

export class PolymorphicHitObjectSerializer extends SealedClassSerializer<HitObject> {
  constructor() {
    super(
      'HitObject',
      // @ts-expect-error TODO: make types work for abstract constructors here
      HitObject,
      [...polymorphicHitObjectSerializers.keys()],
      [...polymorphicHitObjectSerializers.values()],
    );
  }

  static #instance = new Lazy(() => new PolymorphicHitObjectSerializer());

  static get instance() {
    return this.#instance.value;
  }
}
