import type { DrawableOsuHitObject } from "@osucad/ruleset-osu";
import { DrawableHitCircle, DrawableSlider, DrawableSliderRepeat, DrawableSliderTail, DrawableSliderTick, Slider, SliderTick, type OsuHitObject } from "@osucad/ruleset-osu";
import type { Beatmap, DrawableHitObject, DrawableRuleset, HitObject } from "@osucad/core";
import { EasingFunction } from "@osucad/framework";

const  FADE_IN_DURATION_MULTIPLIER = 0.4;
const  FADE_OUT_DURATION_MULTIPLIER = 0.3;

export function applyHiddenMod(beatmap: Beatmap, ruleset: DrawableRuleset)
{
  for (const hitObject of beatmap.hitObjects)
    adjustFadeInTime(hitObject);

  const trackedDrawables = new Set<DrawableHitObject>();

  ruleset.playfield.hitObjectApplied.addListener(dho =>
  {
    if (trackedDrawables.has(dho))
      return;

    trackedDrawables.add(dho);

    setupHitObject(dho);
  });

  function setupHitObject(drawable: DrawableHitObject)
  {
    drawable.applyCustomUpdateState.addListener((dho, state) =>
    {
      if (dho !== drawable)
        return;

      applyHiddenState(dho as DrawableOsuHitObject);
    });
  }
}

function applyHiddenState(drawableObject: DrawableOsuHitObject)
{
  const [fadeStartTime, fadeDuration] = getFadeOutParameters(drawableObject);

  if (drawableObject instanceof DrawableHitCircle)
  {
    drawableObject.absoluteSequence(drawableObject.hitObject.startTime - drawableObject.hitObject.timePreempt, () =>
    {
      drawableObject.approachCircle.hide();
    });
  }

  if (drawableObject instanceof DrawableSliderTail)
  {
    drawableObject.absoluteSequence(fadeStartTime, () => drawableObject.fadeOut(fadeDuration));
  }
  else if (drawableObject instanceof DrawableSliderRepeat)
  {
    drawableObject.absoluteSequence(fadeStartTime, () => drawableObject.circlePiece.fadeOut(fadeDuration));

    drawableObject.absoluteSequence(drawableObject.hitStateUpdateTime, () =>drawableObject.fadeOut());
  }
  else if (drawableObject instanceof DrawableHitCircle)
  {
    drawableObject.absoluteSequence(fadeStartTime, () => drawableObject.fadeOut(fadeDuration));
  }
  else if (drawableObject instanceof DrawableSlider)
  {
    drawableObject.absoluteSequence(fadeStartTime, () => drawableObject.body.fadeOut(fadeDuration, EasingFunction.Out));
  }
  else if (drawableObject instanceof DrawableSliderTick)
  {
    drawableObject.absoluteSequence(fadeStartTime, () => drawableObject.fadeOut(fadeDuration));
  }
}

function adjustFadeInTime(hitObject: HitObject)
{
  (hitObject as OsuHitObject).timeFadeIn *= FADE_IN_DURATION_MULTIPLIER;
  for (const nested of hitObject.nestedHitObjects)
    adjustFadeInTime(nested);
}

function getFadeOutParameters(drawableObject: DrawableHitObject)
{
  if (drawableObject instanceof DrawableSliderTail)
    return getParameters(drawableObject.slider!.headCircle!);

  if (drawableObject instanceof DrawableSliderRepeat)
    return getParameters(drawableObject.slider!.headCircle!);

  return getParameters(drawableObject.hitObject as OsuHitObject);
}

function getParameters(hitObject: OsuHitObject): [number, number]
{
  const fadeOutStartTime = hitObject.startTime - hitObject.timePreempt + hitObject.timeFadeIn;
  const fadeOutDuration = hitObject.timePreempt * FADE_OUT_DURATION_MULTIPLIER;

  const longFadeDuration = hitObject.endTime - fadeOutStartTime;

  if (hitObject instanceof Slider)
    return [fadeOutStartTime, longFadeDuration];

  if (hitObject instanceof SliderTick)
  {
    const tickFadeOutDuration = Math.min(hitObject.timePreempt - DrawableSliderTick.ANIM_DURATION, 1000);
    return [hitObject.startTime - tickFadeOutDuration, tickFadeOutDuration];
  }

  return [fadeOutStartTime, fadeOutDuration];
}
