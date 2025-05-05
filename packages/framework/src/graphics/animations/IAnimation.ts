export interface IAnimation 
{
  get duration(): number;

  get finishedPlaying(): boolean;

  isPlaying: boolean;

  loop: boolean;

  seek: (time: number) => void;

  playbackPosition: number;
}
