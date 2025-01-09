import type { IBeatmap, ISkin, ISkinComponentLookup, SkinConfig } from '@osucad/common';
import type { Drawable } from 'osucad-framework';
import type { ManiaBeatmap } from '../../beatmaps/ManiaBeatmap';
import type { StageDefinition } from '../../beatmaps/StageDefinition';
import { SkinTransformer } from '@osucad/common';
import { Color } from 'pixi.js';
import { LegacyManiaSkinConfigurationLookups } from '../LegacyManiaSkinConfigurationLookups';
import { ManiaSkinComponentLookup } from '../ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../ManiaSkinComponents';
import { ManiaSkinConfigurationLookup } from '../ManiaSkinConfigurationLookup';
import { ArgonColumnBackground } from './ArgonColumnBackground';
import { ArgonHitTarget } from './ArgonHitTarget';
import { ArgonHoldBodyPiece } from './ArgonHoldBodyPiece';
import { ArgonHoldNoteHeadPiece } from './ArgonHoldNoteHeadPiece';
import { ArgonHoldNoteTailPiece } from './ArgonHoldNoteTailPiece';
import { ArgonKeyArea } from './ArgonKeyArea';
import { ArgonNotePiece } from './ArgonNotePiece';
import { ArgonStageBackground } from './ArgonStageBackground';

const color_special_column = new Color('rgba(169, 106, 255, 255)');

const total_colors = 6;

const color_yellow = new Color('rgba(255, 197, 40, 255)');
const color_orange = new Color('rgba(252, 109, 1, 255)');
const color_pink = new Color('rgba(213, 35, 90, 255)');
const color_purple = new Color('rgba(203, 60, 236, 255)');
const color_cyan = new Color('rgba(72, 198, 255, 255)');
const color_green = new Color('rgba(100, 192, 92, 255)');

export class ArgonManiaSkinTransformer extends SkinTransformer {
  constructor(source: ISkin, beatmap: IBeatmap) {
    super(source);

    this.#beatmap = beatmap as unknown as ManiaBeatmap;
  }

  #beatmap!: ManiaBeatmap;

  override getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    if (lookup instanceof ManiaSkinComponentLookup) {
      switch (lookup.component) {
        case ManiaSkinComponents.StageBackground:
          return new ArgonStageBackground();

        case ManiaSkinComponents.ColumnBackground:
          return new ArgonColumnBackground();

        case ManiaSkinComponents.KeyArea:
          return new ArgonKeyArea();

        case ManiaSkinComponents.Note:
          return new ArgonNotePiece();

        case ManiaSkinComponents.HoldNoteHead:
          return new ArgonHoldNoteHeadPiece();

        case ManiaSkinComponents.HoldNoteTail:
          return new ArgonHoldNoteTailPiece();

        case ManiaSkinComponents.HoldNoteBody:
          return new ArgonHoldBodyPiece();

        case ManiaSkinComponents.HitTarget:
          return new ArgonHitTarget();
      }
    }

    return super.getDrawableComponent(lookup);
  }

  override getConfig<T>(lookup: SkinConfig<T>): T | null {
    if (lookup instanceof ManiaSkinConfigurationLookup) {
      const columnIndex = lookup.columnIndex ?? 0;
      const stage = this.#beatmap.getStageForColumnIndex(columnIndex);

      switch (lookup.lookup) {
        case LegacyManiaSkinConfigurationLookups.ColumnSpacing:
          return 2 as any;

        case LegacyManiaSkinConfigurationLookups.ColumnWidth:
          return 60 * (stage.isSpecialColumn(columnIndex) ? 2 : 1) as any;

        case LegacyManiaSkinConfigurationLookups.StagePaddingBottom:
        case LegacyManiaSkinConfigurationLookups.StagePaddingTop:
          return 30 as any;

        case LegacyManiaSkinConfigurationLookups.ColumnBackgroundColor:
          return this.#getColorForLayout(columnIndex, stage) as any;
      }
    }

    return super.getConfig(lookup);
  }

  #getColorForLayout(columnIndex: number, stage: StageDefinition): Color {
    columnIndex %= stage.columns;

    switch (stage.columns) {
      case 1:
        return color_yellow;

      case 2:
        switch (columnIndex) {
          case 0: return color_green;

          case 1: return color_cyan;

          default: throw new Error('column index out of bounds');
        }

      case 3:
        switch (columnIndex) {
          case 0: return color_green;

          case 1: return color_special_column;

          case 2: return color_cyan;

          default: throw new Error('column index out of bounds');
        }

      case 4:
        switch (columnIndex) {
          case 0: return color_yellow;

          case 1: return color_orange;

          case 2: return color_pink;

          case 3: return color_purple;

          default: throw new Error('column index out of bounds');
        }

      case 5:
        switch (columnIndex) {
          case 0: return color_pink;

          case 1: return color_orange;

          case 2: return color_yellow;

          case 3: return color_green;

          case 4: return color_cyan;

          default: throw new Error('column index out of bounds');
        }

      case 6:
        switch (columnIndex) {
          case 0: return color_pink;

          case 1: return color_orange;

          case 2: return color_green;

          case 3: return color_cyan;

          case 4: return color_orange;

          case 5: return color_pink;

          default: throw new Error('column index out of bounds');
        }

      case 7:
        switch (columnIndex) {
          case 0: return color_pink;

          case 1: return color_orange;

          case 2: return color_pink;

          case 3: return color_special_column;

          case 4: return color_pink;

          case 5: return color_orange;

          case 6: return color_pink;

          default: throw new Error('column index out of bounds');
        }

      case 8:
        switch (columnIndex) {
          case 0: return color_purple;

          case 1: return color_pink;

          case 2: return color_orange;

          case 3: return color_green;

          case 4: return color_cyan;

          case 5: return color_orange;

          case 6: return color_pink;

          case 7: return color_purple;

          default: throw new Error('column index out of bounds');
        }

      case 9:
        switch (columnIndex) {
          case 0: return color_purple;

          case 1: return color_pink;

          case 2: return color_orange;

          case 3: return color_yellow;

          case 4: return color_special_column;

          case 5: return color_yellow;

          case 6: return color_orange;

          case 7: return color_pink;

          case 8: return color_purple;

          default: throw new Error('column index out of bounds');
        }

      case 10:
        switch (columnIndex) {
          case 0: return color_purple;

          case 1: return color_pink;

          case 2: return color_orange;

          case 3: return color_yellow;

          case 4: return color_green;

          case 5: return color_cyan;

          case 6: return color_yellow;

          case 7: return color_orange;

          case 8: return color_pink;

          case 9: return color_purple;

          default: throw new Error('column index out of bounds');
        }
    }

    if (stage.isSpecialColumn(columnIndex))
      return color_special_column;

    switch (columnIndex % total_colors) {
      case 0: return color_yellow;

      case 1: return color_orange;

      case 2: return color_pink;

      case 3: return color_purple;

      case 4: return color_cyan;

      case 5: return color_green;

      default: throw new Error('column index out of bounds');
    }
  }
}
