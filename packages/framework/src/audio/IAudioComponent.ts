export interface IAudioComponent
{
  readonly name: string;

  readonly isLoaded: boolean

  readonly hasCompleted: boolean

  readonly isAlive: boolean

  readonly isDisposed: boolean

  update(): void

  dispose(): void
}
