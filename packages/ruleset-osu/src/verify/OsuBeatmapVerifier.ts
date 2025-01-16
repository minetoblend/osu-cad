import type { BeatmapCheck, GeneralCheck } from '@osucad/core';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { BeatmapVerifier, CheckBgPresence, CheckBgResolution, CheckDrainTime, CheckGenreLanguage, CheckGuestTags, CheckHitSoundDelay, CheckInconsistenMetadata, CheckInconsistentTimingPoints, CheckMarkerFormat, CheckZeroBytes } from '@osucad/core';
import { CheckAbnormalNodes } from './compose/CheckAbnormalNodes';
import { CheckAbnormalSpacing } from './compose/CheckAbnormalSpacing';
import { CheckAmbiguity } from './compose/CheckAmbiguity';
import { CheckBurai } from './compose/CheckBurai';
import { CheckConcurrent } from './compose/CheckConcurrent';
import { CheckInvisibleSlider } from './compose/CheckInvisibleSlider';
import { CheckNinjaSpinner } from './compose/CheckNinjaSpinner';
import { CheckObscuredReverse } from './compose/CheckObscuredReverse';
import { CheckOffscreen } from './compose/CheckOffscreen';
import { CheckMuted } from './hitsounds/CheckMuted';
import { CheckConcurrentControlPoints } from './settings/CheckConcurrentControlPoints';
import { CheckDefaultColors } from './settings/CheckDefaultColors';
import { CheckDifficultySettings } from './settings/CheckDifficultySettings';
import { CheckLuminosity } from './settings/CheckLuminosity';
import { CheckTickRate } from './settings/CheckTickRate';
import { CheckCloseOverlap } from './spread/CheckCloseOverlap';
import { CheckMultipleReverse } from './spread/CheckMultipleReverse';
import { CheckShortSliders } from './spread/CheckShortSliders';
import { CheckSpaceVariation } from './spread/CheckSpaceVariation';
import { CheckSpinnerRecovery } from './spread/CheckSpinnerRecovery';
import { CheckBeforeLine } from './timing/CheckBeforeLine';

export class OsuBeatmapVerifier extends BeatmapVerifier<OsuHitObject> {
  override get beatmapChecks(): BeatmapCheck<OsuHitObject>[] {
    return [
      new CheckAbnormalSpacing(),
      new CheckObscuredReverse(),
      new CheckNinjaSpinner(),
      new CheckBurai(),
      new CheckAmbiguity(),
      new CheckAbnormalNodes(),
      new CheckConcurrent(),
      new CheckDrainTime(),
      new CheckInvisibleSlider(),
      new CheckMuted(),
      new CheckDefaultColors(),
      new CheckDifficultySettings(),
      new CheckLuminosity(),
      new CheckTickRate(),
      new CheckConcurrentControlPoints(),
      new CheckMultipleReverse(),
      new CheckShortSliders(),
      new CheckSpaceVariation(),
      new CheckSpinnerRecovery(),
      new CheckBeforeLine(),
      new CheckOffscreen(),
    ];
  }

  override get generalChecks(): GeneralCheck[] {
    return [
      new CheckHitSoundDelay(),
      new CheckZeroBytes(),
      new CheckGuestTags(),
      new CheckGenreLanguage(),
      new CheckInconsistenMetadata(),
      new CheckMarkerFormat(),
      new CheckBgPresence(),
      new CheckBgResolution(),
      new CheckCloseOverlap(),
      new CheckInconsistentTimingPoints(),
    ];
  }
}
