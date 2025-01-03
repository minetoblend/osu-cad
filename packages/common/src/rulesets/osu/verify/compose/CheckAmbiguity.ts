import type { Vec2 } from 'osucad-framework';
import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { PathType } from '../../hitObjects/PathType';
import { Slider } from '../../hitObjects/Slider';
import { SliderTick } from '../../hitObjects/SliderTick';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckAmbiguity.cs
export class CheckAmbiguity extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Ambiguous slider intersection',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing sliders from being excessively difficult, or even impossible, to read in gameplay.
              <image-right>
                  https://i.imgur.com/Y3TB2m7.png
                  A slider with a 3-way intersection in the middle. Considered readable if and only if the
                  middle section goes up to the left and down on the right.
              </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Giving the player little to no hints as to how to move their cursor through the slider makes for an
              unfair gameplay experience. This means the majority of the difficulty does not stem from how well the
              player can click on and move through the slider, but from how well they can guess how to move through
              it. If implemented well, however, it is possible for the player to learn how to move through the
              sliders before they are able to fail from guessing wrong.
              <br \\><br \\>
              Particularly slow sliders, for instance, may move their follow circle slow enough for players to correct
              themselves if they guessed wrong, whereas fast sliders often do not include as many slider ticks and are
              as such more lenient. Sliders that do not require that the player move their cursor are also hard to fail
              from guessing wrong since there it often doesn't matter if they know how to position their cursor.
              <image-right>
                  https://i.imgur.com/LPVmy81.png
                  Two sliders which are practically the same in gameplay. The left one has a much higher chance of
                  players guessing wrong on due to the tail not being visible.
              </image>"
          `),
        },
      ],
    };
  }

  override * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      const tailPosition = slider.getPositionAtTime(slider.startTime + slider.spanDuration);
      const curveEdgesDistance = tailPosition.distance(slider.stackedPosition);

      if (curveEdgesDistance <= 5 && couldSliderBreak(slider)) {
        yield this.createIssue({
          level: 'warning',
          message: '',
          timestamp: slider,
        });
      }

      const anchorPositions = getAnchorPositions(slider);

      let prevAnchorPosition = anchorPositions[0];
      let curDistance = 0;
      let totalDistance = 0;

      for (let i = 1; i < anchorPositions.length; ++i)
        totalDistance += anchorPositions[i - 1].distance(anchorPositions[i]);

      for (const anchorPosition of anchorPositions) {
        const prevAnchorDistance = anchorPosition.distance(prevAnchorPosition);
        curDistance += prevAnchorDistance;

        let headAnchorDistance: number | undefined;
        let tailAnchorDistance: number | undefined;

        // We only consider ones over 60 px apart since things like zig-zag patterns would otherwise be false-positives.
        if (curDistance > 60)
          headAnchorDistance = anchorPosition.length();

        if (totalDistance - curDistance > 60)
          tailAnchorDistance = anchorPosition.distance(slider.path.endPosition);

        if (headAnchorDistance !== undefined && headAnchorDistance <= 5) {
          yield this.createIssue({
            level: 'warning',
            message: `Head and red anchor overlap is possibly ambigious.`,
            timestamp: slider,
          });

          break;
        }

        if (tailAnchorDistance !== undefined && tailAnchorDistance <= 5) {
          yield this.createIssue({
            level: 'warning',
            message: `Tail and red anchor overlap is possibly ambigious.`,
            timestamp: slider,
          });

          break;
        }

        prevAnchorPosition = anchorPosition;
      }
    }
  }
}

function getAnchorPositions(slider: Slider) {
  let currentType = slider.controlPoints[0].type;
  const anchorPositions: Vec2[] = [];
  for (const point of slider.controlPoints) {
    if (point.type !== null) {
      currentType = point.type;
      anchorPositions.push(point.position);
      continue;
    }

    if (currentType === PathType.Linear)
      anchorPositions.push(point.position);
  }

  return anchorPositions;
}

function couldSliderBreak(slider: Slider) {
  return maxDistanceFromHead(slider) - slider.radius * 2 > 0;
}

function maxDistanceFromHead(slider: Slider) {
  let maxDistance = 0;

  for (const tick of slider.nestedHitObjects) {
    if (!(tick instanceof SliderTick))
      continue;

    const tickPosition = tick.stackedPosition;
    const distance = tickPosition.distance(slider.position);

    if (distance > maxDistance)
      maxDistance = distance;
  }

  return maxDistance;
}
