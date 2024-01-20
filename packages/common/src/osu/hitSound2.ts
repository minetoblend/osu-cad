import {hitObjectId} from "./hitObject";

export class HitSoundSample {

  constructor(options: SerializedHitSoundSample) {
    this.id = options.id;
    this.time = options.time;
  }

  id = hitObjectId();
  time: number;

  selected = false;

  serialize(): SerializedHitSoundSample {
    return {
      id: this.id,
      time: this.time,
    };
  }

}

export interface SerializedHitSoundSample {
  id: string;
  time: number;
}