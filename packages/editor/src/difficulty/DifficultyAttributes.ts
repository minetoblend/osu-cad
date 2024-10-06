export class DifficultyAttributes {
  protected static readonly ATTRIB_ID_AIM = 1;
  protected static readonly ATTRIB_ID_SPEED = 3;
  protected static readonly ATTRIB_ID_OVERALL_DIFFICULTY = 5;
  protected static readonly ATTRIB_ID_APPROACH_RATE = 7;
  protected static readonly ATTRIB_ID_MAX_COMBO = 9;
  protected static readonly ATTRIB_ID_DIFFICULTY = 11;
  protected static readonly ATTRIB_ID_GREAT_HIT_WINDOW = 13;
  protected static readonly ATTRIB_ID_SCORE_MULTIPLIER = 15;
  protected static readonly ATTRIB_ID_FLASHLIGHT = 17;
  protected static readonly ATTRIB_ID_SLIDER_FACTOR = 19;
  protected static readonly ATTRIB_ID_SPEED_NOTE_COUNT = 21;
  protected static readonly ATTRIB_ID_SPEED_DIFFICULT_STRAIN_COUNT = 23;
  protected static readonly ATTRIB_ID_AIM_DIFFICULT_STRAIN_COUNT = 25;

  public starRating: number = 0;

  public maxCombo: number = 0;

  constructor(starRating = 0) {
    this.starRating = starRating;
  }
}
