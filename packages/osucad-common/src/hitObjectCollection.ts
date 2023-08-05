import {shallowReactive, shallowRef} from "vue";
import {
  IObjectAttributes,
  ITypeFactory,
  IUnisonRuntime,
  SortedCollection,
} from "@osucad/unison";

import {HitObject} from "./hitObject";
import ShortUniqueId from "short-unique-id";
import {Circle} from "./circle";

const uid = new ShortUniqueId({ length: 6 });

export class HitObjectCollection extends SortedCollection<HitObject> {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, HitObjectCollectionFactory.Attributes, "startTime");
  }

  protected createUniqueId(): string {
    return uid();
  }

  initializeFirstTime(): void {
    this._items = shallowReactive([] as HitObject[]);
  }

  insert(item: HitObject): void {
    if (item.isGhost) {
      this._insert(item, this.createUniqueId());
      return;
    }
    super.insert(item);
  }

  remove(item: HitObject): void {
    if (item.isGhost) {
      this._remove(item);
      return;
    }
    super.remove(item);
  }

  getRange(startTime: number, endTime: number, include?: Set<string>) {
    if (include) {
      return this.items.filter(
        (o) =>
          (o.endTime >= startTime && o.startTime < endTime) ||
          include.has(o.id!),
      );
    }
    return this.items.filter(
      (o) => o.endTime >= startTime && o.startTime < endTime,
    );
  }

  getPaddedRange(startTime: number, endTime: number, padding: number, include?: Set<string>) {
    let startIndex = this.items.findIndex(o => o.endTime >= startTime);
    let endIndex = this.items.findIndex(o => o.startTime >= endTime, startIndex);

    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = this.items.length - 1;


    const items = this.items.slice(Math.max(startIndex - padding, 0), Math.min(endIndex + 1 + padding, this.items.length));

    if (include) {
      items.push(...this.items.filter(
        (o) =>
          include.has(o.id!) && !items.includes(o),
      ));
    }

    return items;
  }

  override onItemChange(item: HitObject, key: string, value: any) {
    super.onItemChange(item, key, value);

    if (key === "newCombo" || key === "startTime") {
      this.calculateCombos();
    }
  }

  onChange() {
    this.calculateCombos();
  }

  calculateCombos() {
    let comboIndex = 0;
    let comboNumber = 0;

    this.items.forEach((hitObject, index) => {
      if (hitObject.newCombo && index > 0) {
        comboIndex++;
        comboNumber = 1;
      } else {
        comboNumber++;
      }
      hitObject.comboIndex = comboIndex;
      hitObject.comboNumber = comboNumber;
    });
  }
}

export class HitObjectCollectionFactory
  implements ITypeFactory<HitObjectCollection> {
  constructor() {
  }

  static readonly Type = "@osucad/hitObjectCollection";

  get type() {
    return HitObjectCollectionFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: HitObjectCollectionFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return HitObjectCollectionFactory.Attributes;
  }

  create(runtime: IUnisonRuntime) {
    return new HitObjectCollection(runtime);
  }
}
