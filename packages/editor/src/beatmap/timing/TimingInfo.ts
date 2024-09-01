export class TimingInfo {
  constructor(
    readonly beatLength: number,
    readonly meter: number = 4,
  ) {

  }

  get bpm() {
    return 60_000 / this.beatLength;
  }

  withBeatLength(beatLength: number) {
    return new TimingInfo(beatLength);
  }

  withBpm(bpm: number) {
    return new TimingInfo(60_000 / bpm);
  }
}
