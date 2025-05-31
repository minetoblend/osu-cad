export class SpinnerSpinHistory
{
  public get totalRotation(): number
  {
    return 360 * this.#completedSpins.length + this.#currentSpinMaxRotation;
  }

  readonly #completedSpins: CompletedSpin[] = [];

  #totalAccumulatedRotation = 0;
  #totalAccumulatedRotationAtLastCompletion = 0;

  #currentSpinMaxRotation = 0;

  get #currentSpinRotation()
  {
    return this.#totalAccumulatedRotation - this.#totalAccumulatedRotationAtLastCompletion;
  }

  #lastReportTime = Number.NEGATIVE_INFINITY;

  reportDelta(currentTime: number, delta: number)
  {
    if (delta === 0)
      return;

    this.#totalAccumulatedRotation += delta;

    if (currentTime >= this.#lastReportTime)
    {
      this.#currentSpinMaxRotation = Math.max(this.#currentSpinMaxRotation, Math.abs(this.#currentSpinRotation));

      while (this.#currentSpinMaxRotation >= 360)
      {
        const direction = Math.sign(this.#currentSpinMaxRotation);

        this.#completedSpins.push(new CompletedSpin(currentTime, direction));

        this.#totalAccumulatedRotationAtLastCompletion += direction * 360;

        this.#currentSpinMaxRotation = Math.abs(this.#currentSpinRotation);
      }
    }
    else
    {
      while (this.#completedSpins.length > 0 && this.#completedSpins[this.#completedSpins.length - 1].completionTime > currentTime)
      {
        const segment = this.#completedSpins.pop()!;
        this.#totalAccumulatedRotationAtLastCompletion -= segment.direction * 360;
      }

      this.#currentSpinMaxRotation = Math.abs(this.#currentSpinRotation);
    }

    this.#lastReportTime = currentTime;
  }
}

class CompletedSpin
{
  constructor(readonly completionTime: number, readonly direction: number)
  {
  }
}
