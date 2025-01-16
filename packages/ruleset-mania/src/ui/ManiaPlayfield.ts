import type { DrawableHitObject, HitObject } from '@osucad/core';
import type { Vec2 } from '@osucad/framework';
import type { StageDefinition } from '../beatmaps/StageDefinition';
import type { ManiaHitObject } from '../objects/ManiaHitObject';
import type { Column } from './Column';
import { ScrollingPlayfield } from '@osucad/core';
import { Axes, GridContainer, provide } from '@osucad/framework';
import { BarLine } from '../objects/BarLine';
import { ManiaAction } from './ManiaAction';
import { Stage } from './Stage';

@provide(ManiaPlayfield)
export class ManiaPlayfield extends ScrollingPlayfield {
  get stages(): readonly Stage[] {
    return this.#stages;
  }

  readonly #stages: Stage[] = [];

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    for (const stage of this.#stages) {
      if (stage.receivePositionalInputAt(screenSpacePosition))
        return true;
    }

    return false;
  }

  constructor(stageDefinitions: readonly StageDefinition[]) {
    super();

    console.assert(stageDefinitions.length > 0);

    const stages: Stage[] = [];

    const columnAction = ManiaAction.Key1;
    let firstColumnIndex = 0;

    for (const stageDefinition of stageDefinitions) {
      const newStage = this.createStage(firstColumnIndex, stageDefinition, columnAction);

      stages.push(newStage);

      this.#stages.push(newStage);
      this.addNested(newStage);

      firstColumnIndex += newStage.columns.length;
    }

    this.addInternal(new GridContainer({
      relativeSizeAxes: Axes.Both,
      content: [stages],
    }));
  }

  protected createStage(firstColumnIndex: number, stageDefinition: StageDefinition, columnAction: ManiaAction): Stage {
    return new Stage(firstColumnIndex, stageDefinition, columnAction);
  }

  override addHitObject(hitObject: HitObject) {
    if (hitObject instanceof BarLine) {
      this.#stages.forEach(stage => stage.addHitObject(hitObject));
      return;
    }

    this.#getStageByColumn((hitObject as ManiaHitObject).column)?.addHitObject(hitObject);
  }

  override removeHitObject(hitObject: HitObject): boolean {
    return this.#getStageByColumn((hitObject as ManiaHitObject).column)?.removeHitObject(hitObject) ?? false;
  }

  override addDrawableHitObject(h: DrawableHitObject) {
    this.#getStageByColumn((h.hitObject as ManiaHitObject).column)?.addDrawableHitObject(h);
  }

  override removeDrawableHitObject(h: DrawableHitObject): boolean {
    return this.#getStageByColumn((h.hitObject as ManiaHitObject).column)?.removeDrawableHitObject(h) ?? false;
  }

  getColumnByPosition(screenSpacePosition: Vec2) {
    let found: Column | null = null;

    for (const stage of this.#stages) {
      for (const column of stage.columns) {
        if (column.receivePositionalInputAt(screenSpacePosition)) {
          found = column;
          break;
        }
      }

      if (found)
        break;
    }

    return found;
  }

  getColumn(index: number) {
    return this.#stages.flatMap(stage => stage.columns).find(column => column.index === index);
  }

  get totalColumns() {
    return this.#stages.flatMap(stage => stage.columns).length;
  }

  #getStageByColumn(column: number) {
    let sum = 0;

    for (const stage of this.#stages) {
      sum += stage.columns.length;
      if (sum > column)
        return stage;
    }

    return null;
  }
}
