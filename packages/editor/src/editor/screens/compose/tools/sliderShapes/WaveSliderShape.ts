import { Vec2, clamp } from 'osucad-framework';
import { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint';
import { PathType } from '../../../../../beatmap/hitObjects/PathType';
import { SliderShape } from './SliderShape';

export class WaveSliderShape extends SliderShape {
  constructor(
    position: Vec2,
    bridgeAnchor = new Vec2(0.5, 0.2),
  ) {
    super();
    this.startPosition = this.endPosition = position;
    this.bridgeAnchor = bridgeAnchor;
  }

  bridgeAnchor: Vec2;

  createPathPoints(): PathPoint[] {
    const endPosition = this.endPosition.sub(this.startPosition);

    const length = endPosition.length();

    const anchor = this.bridgeAnchor.rotate(endPosition.angle());

    return [
      new PathPoint(Vec2.zero(), PathType.Bezier),
      new PathPoint(anchor.scale(length)),
      new PathPoint(endPosition.sub(anchor.scale(length))),
      new PathPoint(endPosition),
    ];
  }

  setPosition(index: number, position: Vec2) {
    const relativePosition = position.sub(this.startPosition);

    if (index === 0) {
      this.startPosition = position;
    }

    if (index === 1 || index === 2) {
      const endPosition = this.endPosition.sub(this.startPosition);
      const angle = endPosition.angle();
      const length = endPosition.length();

      let anchorPos = relativePosition;

      if (index === 2) {
        anchorPos = endPosition.sub(relativePosition);
      }

      this.bridgeAnchor = anchorPos.rotate(-angle).divF(length);
    }

    if (index === 3) {
      this.endPosition = position;
    }
  }

  scaleBridgeAnchor(multiplier: Vec2) {
    if (multiplier.x > 1 && this.bridgeAnchor.x * multiplier.x > 0.5) {
      multiplier.x = 0.5 / this.bridgeAnchor.x;
      multiplier.y = multiplier.x;
    }

    this.bridgeAnchor = new Vec2(
      clamp(this.bridgeAnchor.x * multiplier.x, 0.01, 1),
      clamp(this.bridgeAnchor.y * multiplier.y, -1, 1),
    );
  }

  flip() {
    this.bridgeAnchor.y *= -1;
  }
}
