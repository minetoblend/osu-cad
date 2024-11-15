import { BeatmapEditorSettings } from './BeatmapEditorSettings';

export class BeatmapSettings {
  editor = new BeatmapEditorSettings();
  difficultyName = '';
  osuWebId = 0;
  audioFileName = '';
  audioLeadIn = 0;
  audioHash = '';
  previewTime = -1;
  countdown = 0;
  sampleSet = 'Normal';
  stackLeniency = 0.7;
  mode = 0;
  letterboxInBreaks = false;
  useSkinSprites = false;
  alwaysShowPlayfield = false;
  overlayPosition = 'NoChange';
  skinPreference = '';
  epilepsyWarning = false;
  countdownOffset = 0;
  specialStyle = false;
  widescreenStoryboard = false;
  samplesMatchPlaybackRate = false;
  backgroundFilename: string | null = null;
}
