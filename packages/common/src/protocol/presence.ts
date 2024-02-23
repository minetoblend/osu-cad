import { fields, TypeNames, variantModule, VariantOf } from 'variant';
import { IVec2 } from '../math';
import { BeatmapId } from './beatmap';

export interface Presence {
  activeBeatmap: BeatmapId | null;
  activity: UserActivity | null;
}

export const UserActivity = variantModule({
  idle: fields<{ lastActive: number }>(),
  composeScreen: fields<{
    cursorPosition: IVec2;
    mouseDown: boolean;
    currentTime: number;
    isPlaying: boolean;
    activeTool?: string;
  }>(),
});

export type UserActivity<T extends TypeNames<typeof UserActivity> = undefined> =
  VariantOf<typeof UserActivity, T>;
