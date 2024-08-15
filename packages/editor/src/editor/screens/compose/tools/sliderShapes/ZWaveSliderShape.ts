import { PathPoint, PathType } from '@osucad/common';
import { Vec2, clamp } from 'osucad-framework';
import { SliderShape } from './SliderShape';

export class ZWaveSliderShape extends SliderShape {
  constructor(
    position: Vec2,
    bridgeAnchor = new Vec2(0.42, 0.08),
  ) {
    super();
    this.startPosition = this.endPosition = position;
    this.bridgeAnchor = bridgeAnchor;
  }

  bridgeAnchor: Vec2;

  createPathPoints(): PathPoint[] {
    const endPosition = this.endPosition.sub(this.startPosition);

    const length = endPosition.length();

    const anchor = this.bridgeAnchor.rotate(endPosition.angle()).scale(length);

    return [
      new PathPoint(Vec2.zero(), PathType.Linear),
      new PathPoint(anchor),
      new PathPoint(endPosition.sub(anchor)),
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
      multiplier = new Vec2(0.5 / this.bridgeAnchor.x);
    }

    this.bridgeAnchor = new Vec2(
      clamp(this.bridgeAnchor.x * multiplier.x, 0.01, 0.5),
      clamp(this.bridgeAnchor.y * multiplier.y, -0.5, 0.5),
    );
  }

  flip() {
    this.bridgeAnchor = this.bridgeAnchor.mul({ x: 1, y: -1 });
  }
}
