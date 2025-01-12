import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { CompositeDrawable, Line, resolved, Vec2 } from 'osucad-framework';

import { Color, Graphics } from 'pixi.js';
import { DrawableSliderBody } from '../../../rulesets/osu/hitObjects/drawables/DrawableSliderBody';
import { OsuHitObject } from '../../../rulesets/osu/hitObjects/OsuHitObject';
import { Slider } from '../../../rulesets/osu/hitObjects/Slider';
import { Spinner } from '../../../rulesets/osu/hitObjects/Spinner';
import { Playfield } from '../../../rulesets/ui/Playfield';
import { minBy } from '../../../utils/arrayUtils';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorClock } from '../../EditorClock';
import { SnapSettings } from './SnapSettings';

export class ModdingScreenSnappingProvider extends CompositeDrawable {
  readonly #graphics = new Graphics();

  readonly #sliderBody = new DrawableSliderBody();

  @resolved(SnapSettings)
  settings!: SnapSettings;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.drawNode!.addChild(this.#graphics);

    this.#sliderBody.borderColor.value = new Color(this.visualizationColor);
    this.#sliderBody.accentColor.value = new Color(0x000000).setAlpha(0);
    this.addAllInternal(this.#sliderBody);
  }

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap<OsuHitObject>;

  @resolved(Playfield)
  playfield!: Playfield;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  * visibleOsuHitObjects() {
    for (const drawableHitObject of this.playfield.allHitObjects) {
      if (!(drawableHitObject.hitObject instanceof OsuHitObject))
        continue;

      const hitObject = drawableHitObject.hitObject! as OsuHitObject;

      if (hitObject instanceof Spinner)
        continue;

      if (hitObject.isVisibleAtTime(this.editorClock.currentTime))
        yield hitObject;
    }
  }

  getSnappedPosition(position: Vec2, showVisualizer = true) {
    const results: SnapResult[] = [];

    for (const drawableHitObject of this.playfield.allHitObjects) {
      if (!(drawableHitObject.hitObject instanceof OsuHitObject))
        continue;

      const hitObject = drawableHitObject.hitObject! as OsuHitObject;

      if (hitObject instanceof Spinner)
        continue;

      results.push(...this.snapToHitObjectPosition(position, hitObject, hitObject.stackedPosition));

      if (hitObject instanceof Slider) {
        results.push(...this.snapToHitObjectPosition(position, hitObject, hitObject.stackedPosition.add(hitObject.path.endPosition)));

        if (this.settings.snapToSliderPath.value)
          results.push(...this.snapToSliderControlPoints(position, hitObject));

        if (this.settings.snapToSliderBorders.value)
          results.push(...this.snapToSliderBorder(position, hitObject));
      }

      if (!(hitObject instanceof Slider))
        continue;
    }

    this.#graphics.clear();
    this.#sliderBody.hitObject = undefined;
    this.#sliderBody.alpha = 0;

    if (results.length === 0)
      return null;

    const closest = minBy(results, it => it.distance);

    if (showVisualizer)
      closest?.visualize?.(this.#graphics);

    return closest;
  }

  visualizationColor = 0xFFFFFF;

  * snapToHitObjectPosition(position: Vec2, hitObject: OsuHitObject, objectPosition: Vec2): Generator<SnapResult> {
    const distance = position.distance(objectPosition);

    if (this.settings.snapToObjectCenters.value && distance < 5) {
      yield {
        distance,
        position: objectPosition,
      };
    }

    const visibileRadius = hitObject.radius * (59 / 64);

    const distanceToRadius = distance - visibileRadius;

    if (Math.abs(distanceToRadius) < 5) {
      let foundConnectingPoint = false;

      for (const other of this.visibleOsuHitObjects()) {
        if (other instanceof Spinner)
          continue;

        if (this.settings.snapToVisualSpacing.value) {
          for (const otherPos of this.getPositions(other)) {
            if (otherPos.equals(objectPosition))
              continue;

            const closestPoint = new Line(objectPosition, otherPos).closestPoint(position);
            const distance = position.distance(closestPoint);

            if (distance < 5) {
              const dir = otherPos.sub(objectPosition).normalize();

              const startPoint = objectPosition.add(dir.scale(visibileRadius));
              const endPoint = objectPosition.add(dir.scale(otherPos.distance(objectPosition) - visibileRadius));

              if (startPoint.distance(closestPoint) > 5)
                continue;

              yield {
                position: startPoint,
                endPosition: endPoint,
                distance,
                visualize: g => g
                  .circle(objectPosition.x, objectPosition.y, visibileRadius)
                  .circle(otherPos.x, otherPos.y, visibileRadius)
                  .moveTo(startPoint.x, startPoint.y)
                  .lineTo(endPoint.x, endPoint.y)
                  .stroke({
                    color: this.visualizationColor,
                    width: 2,
                    alpha: 0.5,
                  })
                  .circle(startPoint.x, startPoint.y, 5)
                  .fill({ color: this.visualizationColor }),
              };

              foundConnectingPoint = true;
            }
          }
        }
      }

      if (foundConnectingPoint || !this.settings.snapToCircleBorders.value)
        return;

      const direction = position.sub(objectPosition).normalize();

      yield {
        distance,
        position: objectPosition.add(direction.scale(visibileRadius)),
        visualize: g => g
          .circle(objectPosition.x, objectPosition.y, visibileRadius)
          .stroke({
            color: this.visualizationColor,
            width: 2,
          }),
      };
    }
  }

  * getPositions(hitObject: OsuHitObject) {
    yield hitObject.stackedPosition;

    if (hitObject instanceof Slider)
      yield hitObject.stackedPosition.add(hitObject.path.endPosition);
  }

  * snapToSliderControlPoints(position: Vec2, slider: Slider): Generator<SnapResult, void, undefined> {
    let anyFound = false;

    for (const point of slider.path.controlPoints) {
      const controlPointPosition = point.position.add(slider.stackedPosition);
      const distance = position.distance(controlPointPosition);

      if (distance < 5) {
        yield {
          position: controlPointPosition,
          distance,
          visualize: (g) => {
            g.circle(controlPointPosition.x, controlPointPosition.y, 5)
              .fill({ color: this.visualizationColor });
          },
        };
        anyFound = true;
      }
    }
  }

  * snapToSliderBorder(position: Vec2, slider: Slider): Generator<SnapResult, void, undefined> {
    const radius = slider.radius * (59 / 64);

    let closestPoint: Vec2 | null = null;
    let minDistance = Number.MAX_VALUE;

    for (let curr = 0; curr < slider.expectedDistance; curr += 3) {
      const pathPosition = slider.path.getPositionAtDistance(curr, new Vec2()).add(slider.stackedPosition);

      const distance = position.distance(pathPosition);

      if (distance - radius < 0)
        return;

      const adjustedDistance = Math.abs(distance - radius);

      if (adjustedDistance < 5 && adjustedDistance < minDistance) {
        const dir = position.sub(pathPosition).normalize();

        closestPoint = pathPosition.add(dir.scale(radius));
        minDistance = adjustedDistance;
      }
    }

    if (closestPoint) {
      yield {
        position: closestPoint,
        distance: closestPoint.distance(position),
        visualize: (g) => {
          g.circle(closestPoint.x, closestPoint.y, 5)
            .fill({ color: this.visualizationColor });

          this.#sliderBody.position = slider.stackedPosition;
          this.#sliderBody.hitObject = slider;
          this.#sliderBody.alpha = 1;
        },
      };
    }
  }
}

export interface SnapResult {
  position: Vec2;
  endPosition?: Vec2;
  distance: number;
  visualize?: (g: Graphics) => void;
}
