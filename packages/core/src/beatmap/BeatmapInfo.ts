import type { SharedStructure } from '@osucad/multiplayer';
import { BindableNumber } from '@osucad/framework';
import { SharedObject } from '@osucad/multiplayer';
import { BindableBeatDivisor } from '../editor/BindableBeatDivisor';
import { RulesetInfo } from '../rulesets/RulesetInfo';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import { BeatmapMetadata } from './BeatmapMetadata';

export class BeatmapInfo extends SharedObject {
  readonly #difficultyName = this.property('difficultyName', '');

  get difficultyNameBindable() {
    return this.#difficultyName.bindable;
  }

  get difficultyName() {
    return this.#difficultyName.value;
  }

  set difficultyName(value) {
    this.#difficultyName.value = value;
  }

  constructor(
    public ruleset: RulesetInfo = new RulesetInfo('osu', 'null placeholder ruleset'),
    public difficulty: BeatmapDifficultyInfo = new BeatmapDifficultyInfo(),
    public metadata: BeatmapMetadata = new BeatmapMetadata(),
  ) {
    super();
  }

  // TODO: BeatmapSetInfo

  onlineId = 0;

  onlineBeatmapSetId = 0;

  length = 0;

  bpm = 0;

  readonly #audioLeadIn = this.property('audioLeadIn', 0);

  get audioLeadInBindable() {
    return this.#audioLeadIn.bindable;
  }

  get audioLeadIn() {
    return this.#audioLeadIn.value;
  }

  set audioLeadIn(value) {
    this.#audioLeadIn.value = value;
  }

  readonly #stackLeniency = this.property('stackLeniency', 0.7);

  get stackLeniencyBindable() {
    return this.#stackLeniency.bindable;
  }

  get stackLeniency() {
    return this.#stackLeniency.value;
  }

  set stackLeniency(value) {
    this.#stackLeniency.value = value;
  }

  readonly #specialStyle = this.property('specialStyle', false);

  get specialStyleBindable() {
    return this.#specialStyle.bindable;
  }

  get specialStyle() {
    return this.#specialStyle.value;
  }

  set specialStyle(value) {
    this.#specialStyle.value = value;
  }

  readonly #letterboxInBreaks = this.property('letterboxInBreaks', false);

  get letterboxInBreaksBindable() {
    return this.#letterboxInBreaks.bindable;
  }

  get letterboxInBreaks() {
    return this.#letterboxInBreaks.value;
  }

  set letterboxInBreaks(value) {
    this.#letterboxInBreaks.value = value;
  }

  readonly #widescreenStoryboard = this.property('widescreenStoryboard', false);

  get widescreenStoryboardBindable() {
    return this.#widescreenStoryboard.bindable;
  }

  get widescreenStoryboard() {
    return this.#widescreenStoryboard.value;
  }

  set widescreenStoryboard(value) {
    this.#widescreenStoryboard.value = value;
  }

  readonly #epilepsyWarning = this.property('epilepsyWarning', false);

  get epilepsyWarningBindable() {
    return this.#epilepsyWarning.bindable;
  }

  get epilepsyWarning() {
    return this.#epilepsyWarning.value;
  }

  set epilepsyWarning(value) {
    this.#epilepsyWarning.value = value;
  }

  readonly #samplesMatchingPlaybackRate = this.property('samplesMatchingPlaybackRate', false);

  get samplesMatchingPlaybackRateBindable() {
    return this.#samplesMatchingPlaybackRate.bindable;
  }

  get samplesMatchingPlaybackRate() {
    return this.#samplesMatchingPlaybackRate.value;
  }

  set samplesMatchingPlaybackRate(value) {
    this.#samplesMatchingPlaybackRate.value = value;
  }

  readonly #distanceSpacing = this.property('distanceSpacing', 1);

  get distanceSpacingBindable() {
    return this.#distanceSpacing.bindable;
  }

  get distanceSpacing() {
    return this.#distanceSpacing.value;
  }

  set distanceSpacing(value) {
    this.#distanceSpacing.value = value;
  }

  readonly beatDivisorBindable = new BindableBeatDivisor(4);

  get beatDivisor() {
    return this.beatDivisorBindable.value;
  }

  set beatDivisor(value) {
    this.beatDivisorBindable.value = value;
  }

  readonly gridSizeBindable = new BindableNumber(16);

  get gridSize() {
    return this.gridSizeBindable.value;
  }

  set gridSize(value) {
    this.gridSizeBindable.value = value;
  }

  readonly #timelineZoom = this.property('timelineZoom', 1);

  get timelineZoomBindable() {
    return this.#timelineZoom.bindable;
  }

  get timelineZoom() {
    return this.#timelineZoom.value;
  }

  set timelineZoom(value) {
    this.#timelineZoom.value = value;
  }

  editorTimestamp?: number;

  readonly #countdownType = this.property('countdownType', 0);

  get countdownTypeBindable() {
    return this.#countdownType.bindable;
  }

  get countdownType() {
    return this.#countdownType.value;
  }

  set countdownType(value) {
    this.#countdownType.value = value;
  }

  readonly #countdownOffset = this.property('countdownOffset', 0);

  get countdownOffsetBindable() {
    return this.#countdownOffset.bindable;
  }

  get countdownOffset() {
    return this.#countdownOffset.value;
  }

  set countdownOffset(value) {
    this.#countdownOffset.value = value;
  }

  readonly #useSkinSprites = this.property('useSkinSprites', false);

  get useSkinSpritesBindable() {
    return this.#useSkinSprites.bindable;
  }

  get useSkinSprites() {
    return this.#useSkinSprites.value;
  }

  set useSkinSprites(value) {
    this.#useSkinSprites.value = value;
  }

  readonly #alwaysShowPlayfield = this.property('alwaysShowPlayfield', false);

  get alwaysShowPlayfieldBindable() {
    return this.#alwaysShowPlayfield.bindable;
  }

  get alwaysShowPlayfield() {
    return this.#alwaysShowPlayfield.value;
  }

  set alwaysShowPlayfield(value) {
    this.#alwaysShowPlayfield.value = value;
  }

  readonly #overlayPosition = this.property('overlayPosition', '');

  get overlayPositionBindable() {
    return this.#overlayPosition.bindable;
  }

  get overlayPosition() {
    return this.#overlayPosition.value;
  }

  set overlayPosition(value) {
    this.#overlayPosition.value = value;
  }

  readonly #skinPreference = this.property('skinPreference', '');

  get skinPreferenceBindable() {
    return this.#skinPreference.bindable;
  }

  get skinPreference() {
    return this.#skinPreference.value;
  }

  set skinPreference(value) {
    this.#skinPreference.value = value;
  }

  bookmarks: number[] = [];

  path?: string;

  override createSummary() {
    return {
      ...super.createSummary(),
      difficulty: this.difficulty.createSummary(),
      metadata: this.metadata.createSummary(),
    };
  }

  override initializeFromSummary(summary: any) {
    super.initializeFromSummary(summary);
    this.difficulty.initializeFromSummary(summary.difficulty);
    this.metadata.initializeFromSummary(summary.metadata);
  }

  override get childObjects(): readonly SharedStructure<any>[] {
    return [
      this.difficulty,
      this.metadata,
    ];
  }
}
