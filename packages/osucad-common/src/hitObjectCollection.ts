import {shallowReactive} from "vue";
import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SortedCollection,} from "@osucad/unison";

import {HitObject} from "./hitObject";

export class HitObjectCollection extends SortedCollection<HitObject> {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, HitObjectCollectionFactory.Attributes, "startTime");
  }

  initializeFirstTime(): void {
    this._items = shallowReactive([] as HitObject[]);
  }

  getRange(startTime: number, endTime: number) {
    if (this.length === 0) return [];
    let { index, found } = this.binarySearch(startTime);
    if (!found && index > 0) index--;

    const startIndex = index;

    while (index < this.length && this.get(index)!.startTime < endTime) index++;

    return this.slice(startIndex, index);
  }

  override onItemChange(item: HitObject, key: string, value: any) {
    super.onItemChange(item, key, value);

    if (key === "newCombo") {
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
  implements ITypeFactory<HitObjectCollection>
{
  constructor() {}

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
