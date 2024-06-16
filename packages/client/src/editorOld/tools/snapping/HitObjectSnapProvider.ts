import { SnapProvider, SnapResult } from './SnapProvider.ts';
import {
  HitCircle,
  HitObject,
  PathType,
  Slider,
  SnappingPreferences,
  Vec2,
} from '@osucad/common';
import { ComposeTool } from '../ComposeTool.ts';
import { PathApproximator, Vector2 } from 'osu-classes';
import { Graphics } from 'pixi.js';
import { usePreferences } from '@/composables/usePreferences.ts';

export class HitObjectSnapProvider implements SnapProvider {
  constructor(private readonly tool: ComposeTool) {
    const { preferences } = usePreferences();
    this.preferences = preferences.viewport.snapping;
  }

  preferences: SnappingPreferences;

  visualizer = new Graphics({
    eventMode: 'none',
  });

  visualSpacingDistance = 10;

  snap(positions: Vec2[], exclude?: HitObject[]): SnapResult[] {
    if (this.tool.visibleHitObjects.length == 0) return [];
    let bestResult: SnapResult | undefined = undefined;

    const thresholdSquared = 5 * 5;

    const visibleHitObjectPositions: (Vec2 & {
      draw?: (g: Graphics) => void;
    })[] = this.tool.visibleHitObjects.flatMap((hitObject) => {
      if (hitObject.isSelected || exclude?.includes(hitObject)) return [];
      if (!this.preferences.objects.enabled) return [];
      if (hitObject instanceof HitCircle) return [hitObject.position];

      if (hitObject instanceof Slider) {
        const positions = [
          hitObject.position,
          Vec2.add(hitObject.position, hitObject.path.endPosition),
        ];
        if (!this.preferences.blanket.enabled) return positions;

        const controlPoints = hitObject.path.controlPoints;
        for (let i = 0; i < controlPoints.length; i++) {
          if (
            controlPoints[i].type === PathType.PerfectCurve &&
            i + 2 < controlPoints.length &&
            controlPoints[i + 1].type === null &&
            ((controlPoints[i + 2].type === null && !controlPoints[i + 3]) ||
              (controlPoints[i + 2].type !== null && !!controlPoints[i + 3]))
          ) {
            const arcProperties = PathApproximator._circularArcProperties([
              new Vector2(controlPoints[i].x, controlPoints[i].y),
              new Vector2(controlPoints[i + 1].x, controlPoints[i + 1].y),
              new Vector2(controlPoints[i + 2].x, controlPoints[i + 2].y),
            ]);
            if (arcProperties.isValid) {
              positions.push(
                Object.assign(hitObject.position.add(arcProperties.centre), {
                  draw: (g: Graphics) => {
                    console.log('draw');

                    g.circle(
                      hitObject.position.x + arcProperties.centre.x,
                      hitObject.position.y + arcProperties.centre.y,
                      arcProperties.radius,
                    );
                    g.stroke({ color: 0xffffff, alpha: 0.25, width: 2 });
                    g.moveTo(
                      hitObject.position.x + controlPoints[i].x,
                      hitObject.position.y + controlPoints[i].y,
                    );
                    g.arc(
                      hitObject.position.x + arcProperties.centre.x,
                      hitObject.position.y + arcProperties.centre.y,
                      arcProperties.radius,
                      arcProperties.thetaStart,
                      arcProperties.thetaEnd,
                      arcProperties.direction < 0,
                    );
                    g.stroke({ color: 0xffff00, width: 2 });
                  },
                }),
              );
            }
          }
        }
        return positions;
      }
      return [];
    });

    if (
      this.visualSpacingDistance >= 0 &&
      this.preferences.visualSpacing.enabled
    ) {
      const radius = this.tool.visibleHitObjects[0].radius;

      const positions = getHitObjectPositions(
        this.tool.visibleHitObjects.filter((it) => !it.isSelected),
      );
      for (let i = 0; i < positions.length - 1; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          if (
            Vec2.closerThan(positions[i], positions[j], radius * 5) &&
            !Vec2.closerThan(positions[i], positions[j], radius * 2)
          ) {
            const offset = Vec2.sub(positions[j], positions[i]);
            const rotated = offset.rotate(Math.PI / 3);

            visibleHitObjectPositions.push(
              Object.assign(positions[i].add(rotated), {
                draw: (g: Graphics) => {
                  const a = positions[i];
                  const b = positions[j];
                  const c = positions[i].add(rotated);

                  const a1 = a.add(offset.normalize().scale(radius));
                  const b1 = b.sub(offset.normalize().scale(radius));

                  const a2 = a.add(rotated.normalize().scale(radius));
                  const c1 = c.sub(rotated.normalize().scale(radius));

                  const b2 = b.add(
                    offset
                      .rotate((Math.PI / 3) * 2)
                      .normalize()
                      .scale(radius),
                  );
                  const c2 = c.sub(
                    offset
                      .rotate((Math.PI / 3) * 2)
                      .normalize()
                      .scale(radius),
                  );

                  g.moveTo(a1.x, a1.y);
                  g.lineTo(b1.x, b1.y);

                  g.moveTo(a2.x, a2.y);
                  g.lineTo(c1.x, c1.y);

                  g.moveTo(b2.x, b2.y);
                  g.lineTo(c2.x, c2.y);

                  g.stroke({ color: 0xffff00, alpha: 0.8, width: 2 });
                },
              }),
              Object.assign(positions[j].sub(rotated), {
                draw: (g: Graphics) => {
                  const a = positions[i];
                  const b = positions[j];
                  const c = positions[j].sub(rotated);

                  const a1 = a.add(offset.normalize().scale(radius));
                  const b1 = b.sub(offset.normalize().scale(radius));

                  const a2 = a.sub(
                    offset
                      .rotate((Math.PI / 3) * 2)
                      .normalize()
                      .scale(radius),
                  );
                  const c1 = c.add(
                    offset
                      .rotate((Math.PI / 3) * 2)
                      .normalize()
                      .scale(radius),
                  );

                  const b2 = b.sub(rotated.normalize().scale(radius));
                  const c2 = c.add(rotated.normalize().scale(radius));

                  g.moveTo(a1.x, a1.y);
                  g.lineTo(b1.x, b1.y);

                  g.moveTo(a2.x, a2.y);
                  g.lineTo(c1.x, c1.y);

                  g.moveTo(b2.x, b2.y);
                  g.lineTo(c2.x, c2.y);

                  g.stroke({ color: 0xffff00, alpha: 0.8, width: 2 });
                },
              }),
            );
          }

          /*  if (
              Vec2.closerThan(positions[i], positions[j], this.visualSpacingDistance * 2 + radius * 4) &&
              !Vec2.closerThan(positions[i], positions[j], this.visualSpacingDistance * 2 + radius * 2)
            ) {

              const midPoint = positions[0].add(positions[1]).scale(0.5);
              const offset = Vec2.sub(midPoint, positions[i]);

              console.log("midPoint", midPoint);


              const diagonal = radius * 2 + this.visualSpacingDistance;
              const side = offset.length() * 0.5;

              const offsetLength = Math.sqrt(diagonal * diagonal - side * side);

              console.log({
                diagonal,
                side,
                offsetLength,
                posA: Vec2.add(midPoint, offset.normalize().rotate(Math.PI / 2).scale(offsetLength)),
                posB: Vec2.add(midPoint, offset.normalize().rotate(-Math.PI / 2).scale(offsetLength)),
              });

              visibleHitObjectPositions.push(
                Vec2.add(midPoint, offset.normalize().rotate(Math.PI / 2).scale(offsetLength)),
                Vec2.add(midPoint, offset.normalize().rotate(-Math.PI / 2).scale(offsetLength)),
              );
            }*/
        }
      }
    }

    this.visualizer.clear();

    for (const hitObjectPosition of visibleHitObjectPositions) {
      this.visualizer
        .circle(hitObjectPosition.x, hitObjectPosition.y, 2)
        .fill({ color: 0xffffff, alpha: 0.25 });
    }

    for (const position of positions) {
      for (const hitObjectPosition of visibleHitObjectPositions) {
        const offset = Vec2.sub(hitObjectPosition, position);
        const lengthSquared = Vec2.lengthSquared(offset);
        if (
          lengthSquared < thresholdSquared &&
          (!bestResult || lengthSquared < Vec2.lengthSquared(bestResult.offset))
        )
          bestResult = {
            offset,
            position: hitObjectPosition,
            draw: hitObjectPosition.draw,
          };
      }
    }

    bestResult?.draw?.(this.visualizer);

    return bestResult ? [bestResult] : [];
  }
}

export function getHitObjectPositions(hitObjects: HitObject[]): Vec2[] {
  return hitObjects.flatMap((hitObject) => {
    if (hitObject instanceof Slider) {
      return [
        hitObject.position,
        Vec2.add(hitObject.position, hitObject.path.endPosition),
      ];
    }
    return [hitObject.position];
  });
}
