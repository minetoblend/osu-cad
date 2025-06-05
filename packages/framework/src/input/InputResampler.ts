import type { Vec2 } from "../math/Vec2";

export class InputResampler
{
  #lastRelevantPosition: Vec2 | null = null;

  #lastActualPosition: Vec2 | null = null;

  #isRawInput = false;

  resampleRawInput = false;

  #returnedPositions: Vec2[] = [];

  public addPosition(position: Vec2): readonly Vec2[]
  {
    const returnedPositions = this.#returnedPositions;

    returnedPositions.splice(0);

    if (!this.resampleRawInput)
    {
      if (this.#isRawInput)
      {
        this.#lastRelevantPosition = position;
        this.#lastActualPosition = position;

        returnedPositions.push(position);
        return returnedPositions;
      }

      // HD if it has fractions
      if (position.x - Math.trunc(position.x) !== 0)
        this.#isRawInput = true;
    }

    if (this.#lastRelevantPosition === null || this.#lastActualPosition === null)
    {
      this.#lastRelevantPosition = position;
      this.#lastActualPosition = position;

      returnedPositions.push(position);
      return returnedPositions;
    }

    const diff = position.sub(this.#lastRelevantPosition);
    const distance = diff.length();
    const direction = diff.divF(distance);

    const realDiff = position.sub(this.#lastActualPosition);
    const realMovementDistance = realDiff.length();
    if (realMovementDistance < 1)
      return returnedPositions;

    this.#lastActualPosition = position;

    // don't update when it moved less than 10 pixels from the last position in a straight fashion
    // but never update when its less than 2 pixels
    if ((distance < 10 && direction.dot(realDiff.divF(realMovementDistance)) > 0.7) || distance < 2)
      return returnedPositions;

    this.#lastRelevantPosition = position;

    returnedPositions.push(position);

    return returnedPositions;
  }
}
