export interface IClock
{
  get currentTime(): number;

  get rate(): number;

  get isRunning(): boolean;
}
