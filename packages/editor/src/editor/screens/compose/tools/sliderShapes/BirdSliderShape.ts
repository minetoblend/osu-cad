import { Vec2 } from 'osucad-framework';
import { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint';
import { PathType } from '../../../../../beatmap/hitObjects/PathType';
import { SliderShape } from './SliderShape';

export class BirdSliderShape extends SliderShape {
  constructor(
    position: Vec2,
    curveAnchor = new Vec2(0.7, 0.6),
    tailSize = 0.6,
  ) {
    super();
    this.startPosition = this.endPosition = position;

    this.curveAnchor = curveAnchor;
    this.tailSize = tailSize;
  }

  curveAnchor: Vec2;

  tailSize: number;

  get correctedTailSize() {
    if (this.endPosition.x < this.startPosition.x)
      return -this.tailSize;

    return this.tailSize;
  }

  createPathPoints(): PathPoint[] {
    const endPosition = this.endPosition.sub(this.startPosition);

    const length = endPosition.length();

    const tailOffset = endPosition.rotate(Math.PI / 2).scale(this.correctedTailSize);

    const tailPosition = endPosition.scale(0.5).add(tailOffset);

    const startCurveAnchor = this.curveAnchor
      .scale(length * 0.5)
      .mul({ x: 1, y: this.correctedTailSize })
      .rotate(endPosition.angle());

    const endCurveAnchor = endPosition.add(
      this.curveAnchor
        .scale(length * 0.5)
        .mul({ x: -1, y: this.correctedTailSize })
        .rotate(endPosition.angle()),
    );

    return [
      new PathPoint(Vec2.zero(), PathType.Bezier),
      new PathPoint(startCurveAnchor),
      new PathPoint(tailPosition, PathType.Bezier),
      new PathPoint(endCurveAnchor),
      new PathPoint(endPosition),
    ];
  }

  setPosition(index: number, position: Vec2) {
    const relativePosition = position.sub(this.startPosition);

    if (index === 0) {
      this.startPosition = position;
    }

    if (index === 1 || index === 3) {
      const endPosition = this.endPosition.sub(this.startPosition);
      const angle = endPosition.angle();
      const length = endPosition.length();

      const anchorPos = relativePosition.rotate(-angle).divF(length * 0.5);

      if (index === 3) {
        anchorPos.x = 2 - anchorPos.x;
      }

      anchorPos.y /= this.correctedTailSize;

      this.curveAnchor = anchorPos;
    }

    if (index === 2) {
      const span = this.endPosition.sub(this.startPosition);

      const center = span.scale(0.5);

      const distance = relativePosition.sub(center).length();

      let isNegative = relativePosition.sub(center).cross(span) > 0;

      if (this.endPosition.x < this.startPosition.x)
        isNegative = !isNegative;

      this.tailSize = distance / this.endPosition.sub(this.startPosition).length() * (isNegative ? -1 : 1);
    }

    if (index === 4) {
      this.endPosition = position;
    }
  }

  flip() {
    this.tailSize *= -1;
  }
}
