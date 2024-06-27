import { IClock }  from 'osucad-framework'

export class EditorClock implements IClock {

  #currentTime: number = 0;

  get currentTime(): number {
    return this.#currentTime;
  }

  #rate = 1;

  get rate(): number {
    return this.#rate;
  }

  #isRunning = false;

  get isRunning(): boolean {
    return this.#isRunning;
  }

}