export interface IUnisonTokenProvider {
  getToken(
    beatmap: string
  ): Promise<string>;
}