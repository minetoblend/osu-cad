import { Ruleset } from "../rulesets/Ruleset";
import { BeatmapDifficultyInfo } from "./BeatmapDifficultyInfo";
import { BeatmapMetadata } from "./BeatmapMetadata";

export class BeatmapInfo {
  public metadata = new BeatmapMetadata()
  public difficulty = new BeatmapDifficultyInfo()

  public audioFile = '';
  public audioLeadIn = 0;
  public previewTime = -1;
  public countdownType = -1;
  public sampleSet = 'Normal';
  public stackLeniency = 0;
  public ruleset: Ruleset | undefined;
  public letterboxInBreaks = false;
  public useSkinSprites = false;
  public alwaysShowPlayfield = false;
  public overlayPosition = '';
  public skinPreference = '';
  public epilepsyWarning = false;
  public countdownOffset = 0;
  public specialStyle = false;
  public widescreenStoryboard = false;
  public samplesMatchingPlaybackRate = false;

  public readonly onlineInfo = {
    id: -1,
    beatmapSetId: -1,
  }
}