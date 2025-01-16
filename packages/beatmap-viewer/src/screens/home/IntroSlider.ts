import type { Graphics } from 'pixi.js';
import { Anchor, dependencyLoader, GraphicsDrawable, lerp, Vec2 } from '@osucad/framework';

export class IntroSlider extends GraphicsDrawable {
  constructor() {
    super();
  }

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  #snakeInProgress = 0;

  get snakeInProgress() {
    return this.#snakeInProgress;
  }

  set snakeInProgress(value) {
    if (value === this.#snakeInProgress)
      return;

    this.#snakeInProgress = value;
    this.invalidateGraphics();
  }

  updateGraphics(g: Graphics) {
    g.clear();

    const center = new Vec2(0, 80);

    const startAngle = -2.4;

    const endAngle = lerp(-2.2, -Math.PI / 2 - 0.05, this.snakeInProgress);

    const outerRadius = 140;

    const innerRadius = 90;

    const circleCenter = new Vec2(-102, 30);

    this.drawSliderBody(g, center, startAngle, endAngle, innerRadius, outerRadius, circleCenter);

    g.fill({
      color: 0xFFFFFF,
      alpha: 0.5,
    });

    this.drawSliderBody(g, center, startAngle, endAngle, innerRadius, outerRadius, circleCenter);

    g.stroke({
      color: 0xFFFFFF,
      width: 14,
      join: 'round',
    });
  }

  drawSliderBody(g: Graphics, center: Vec2, startAngle: number, endAngle: number, innerRadius: number, outerRadius: number, circleCenter: Vec2) {
    g.beginPath();

    const inner = new Vec2(innerRadius, 0);
    const outer = new Vec2(outerRadius, 0);

    const circleRadius = (outerRadius - innerRadius) / 2;

    const holdoutRadius = circleRadius * 2;

    const innerIntersection = this.circleIntersection(
      circleCenter,
      holdoutRadius,
      center,
      innerRadius,
    )[0];

    const innerStartAngle = innerIntersection.sub(center).angle();

    const outerIntersection = this.circleIntersection(
      circleCenter,
      holdoutRadius,
      center,
      outerRadius,
    )[0];

    const outerStartAngle = outerIntersection.sub(center).angle();

    const p1 = inner.rotate(innerStartAngle).add(center);
    const p2 = outer.rotate(outerStartAngle).add(center);
    const p3 = outer.rotate(endAngle).add(center);
    const p4 = inner.rotate(endAngle).add(center);

    const endPoint = new Vec2((innerRadius + outerRadius) * 0.5, 0).rotate(endAngle).add(center);

    g.arc(center.x, center.y, outerRadius, outerStartAngle, endAngle);

    g.arc(endPoint.x, endPoint.y, circleRadius, endAngle, endAngle + Math.PI);

    g.arc(center.x, center.y, innerRadius, endAngle, innerStartAngle, true);

    g.arc(circleCenter.x, circleCenter.y, holdoutRadius, innerIntersection.sub(circleCenter).angle(), outerIntersection.sub(circleCenter).angle(), true);

    g.closePath();
  }

  circleIntersection(
    p0: Vec2,
    r0: number,
    p1: Vec2,
    r1: number,
  ) {
    const d = p0.distance(p1);
    const a = (r0 ** 2 - r1 ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(r0 ** 2 - a ** 2);

    const p2 = p1.sub(p0).scale(a / d).add(p0);

    const x3 = p2.x + h * (p1.y - p0.y) / d;
    const y3 = p2.y - h * (p1.x - p0.x) / d;
    const x4 = p2.x - h * (p1.y - p0.y) / d;
    const y4 = p2.y + h * (p1.x - p0.x) / d;

    return [new Vec2(x3, y3), new Vec2(x4, y4)];
  }
}
