import { Bindable } from "@osucad/framework";
import type { DDSAttributes } from "@osucad/multiplayer-core";
import { ObjectDDS, type } from "@osucad/multiplayer-core";
import { bindableBacked } from "../utils";

export class BeatmapInfo extends ObjectDDS
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/beatmap-info",
    version: 0,
  };

  public constructor()
  {
    super(BeatmapInfo.attributes);
  }

  @type("string")
  public accessor audioFile = "";

  public readonly backgroundFileBindable = new Bindable("");

  @type("string")
  @bindableBacked("backgroundFileBindable")
  public accessor backgroundFile!: string

  @type("float32")
  public accessor audioLeadIn = 0;

  @type("float32")
  public accessor previewTime = -1;

  @type("int32")
  public accessor countdownType = -1;

  @type("string")
  public accessor sampleSet = "Normal";

  @type("float32")
  public accessor stackLeniency = 0.7;

  @type("boolean")
  public accessor letterboxInBreaks = false;

  @type("boolean")
  public accessor useSkinSprites = false;

  @type("boolean")
  public accessor alwaysShowPlayfield = false;

  @type("string")
  public accessor overlayPosition = "";

  @type("string")
  public accessor skinPreference = "";

  @type("boolean")
  public accessor epilepsyWarning = false;

  @type("int32")
  public accessor countdownOffset = 0;

  @type("boolean")
  public accessor specialStyle = false;

  @type("boolean")
  public accessor widescreenStoryboard = false;

  @type("boolean")
  public accessor samplesMatchingPlaybackRate = false;

  @type("int32")
  public accessor onlineId = -1

  @type("int32")
  public accessor onlineBeatmapSetId = -1
}
