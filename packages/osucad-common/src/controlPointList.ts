import { shallowReactive } from "vue";
import {
  IObjectAttributes,
  IObjectSnapshot,
  ITypeFactory,
  IUnisonRuntime,
  SharedObject,
  nn,
} from "@osucad/unison";
import { generateNKeysBetween } from "fractional-indexing";
import { PathPoint } from "./sliderPath";

export type IControlPointListOperation =
  | IControlPointListInsertOperation
  | IControlPointListUpdateOperation
  | IControlPointListRemoveOperation;

interface PathPointItem extends PathPoint {
  id: string;
}

export interface IControlPointListInsertOperation {
  type: "insert";
  index: number;
  items: PathPointItem[];
}

export interface IControlPointListRemoveOperation {
  type: "remove";
  id: string;
}

export interface IControlPointListUpdateOperation {
  type: "update";
  id: string;
  value: Partial<PathPoint>;
}

export interface IControlPointListSnapshotData {
  controlPoints: PathPointItem[];
}

export class ControlPointList extends SharedObject<
  IControlPointListOperation,
  IControlPointListSnapshotData
> {
  get(index: number): PathPointItem | undefined {
    return this.controlPoints[index];
  }

  append(...points: PathPoint[]) {
    this.insert(this.length, ...points);
  }

  get last() {
    return this.controlPoints[this.controlPoints.length - 1];
  }

  get first() {
    return this.controlPoints[0];
  }

  insert(index: number, ...points: PathPoint[]) {
    const items = points as PathPointItem[];

    const ids = this.createIdsForIndex(index, items.length);
    for (let i = 0; i < items.length; i++) {
      items[i].id = ids[i];
    }

    this._insert(index, items);

    // Todo: add logic to figure out what to do if 2 people insert at the same position at the same time

    const op: IControlPointListInsertOperation = {
      type: "insert",
      index,
      items,
    };

    this.submitOp(op);
  }

  private _insert(index, points: (PathPoint & { id: string })[]) {
    this.controlPoints.splice(index, 0, ...points);
    this.emit("change");
  }

  remove(p: number | PathPointItem) {
    const point: PathPointItem =
      typeof p === "object" ? p : this.controlPoints[p];
    this._remove(point.id);

    const op: IControlPointListRemoveOperation = {
      type: "remove",
      id: point.id,
    };
    this.submitOp(op);
  }

  get length() {
    return this.controlPoints.length;
  }

  updateLast(data: Partial<PathPoint>) {
    this.update(this.controlPoints.length - 1, data);
  }

  update(index: number, data: Partial<PathPoint>) {
    const point = {
      ...this.get(index)!,
      ...data,
    };

    this._update(point.id, point);

    const op: IControlPointListUpdateOperation = {
      type: "update",
      id: point.id,
      value: point,
    };

    this.submitOp(op);
  }

  private _update(id: string, data: Partial<PathPoint>) {
    const index = this.controlPoints.findIndex((it) => it.id === id);
    const point = {
      ...this.get(index)!,
      ...data,
    };

    this.controlPoints[index] = point;
    this.emit('change')
  }

  private _remove(id: string) {
    const index = this.controlPoints.findIndex((it) => it.id === id);
    if (index === -1) {
      console.warn("attempted to remove unkown pathpoint", id);
      return;
    }
    this.controlPoints.splice(index, 1);
    this.emit("change");
  }

  controlPoints = shallowReactive([]) as PathPointItem[];

  createIdsForIndex(index, amount: number = 1) {
    return generateNKeysBetween(
      this.controlPoints[index - 1]?.id,
      this.controlPoints[index]?.id,
      amount
    );
  }

  restore(snapshot: IObjectSnapshot<IControlPointListSnapshotData>): void {
    this.controlPoints.splice(
      0,
      this.controlPoints.length,
      ...snapshot.content.controlPoints
    );
    this.emit('change')
  }

  createSnapshot(): IControlPointListSnapshotData {
    return {
      controlPoints: [...this.controlPoints],
    };
  }

  handle(
    op: IControlPointListOperation,
    local: boolean,
    localOpMetadata?: unknown
  ): void {
    if (local) return;
    switch (op.type) {
      case "insert":
        this._insert(op.index, op.items);
        break;
      case "update": {
        const index = this.controlPoints.findIndex((it) => it.id === op.id);
        if (index === -1) {
          console.warn("unknown index", index);
          return;
        }
        this._update(op.id, op.value);
        break;
      }
      case "remove": {
        this._remove(op.id)
        break;
      }
    }
  }
}

export class ControlPointListFactory implements ITypeFactory<ControlPointList> {
  constructor() {}

  static readonly Type = "@osucad/controlPointList";

  get type() {
    return ControlPointListFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: ControlPointListFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return ControlPointListFactory.Attributes;
  }

  create(runtime: IUnisonRuntime) {
    return new ControlPointList(runtime, this.attributes);
  }
}
