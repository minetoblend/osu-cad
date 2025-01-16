export enum Additions {
  Whistle = 1 << 0,
  Finish = 1 << 1,
  Clap = 1 << 2,

  None = 0,
  All = Whistle | Finish | Clap,
}
