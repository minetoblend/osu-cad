import { DrawableRuleset } from "@osucad/core";
import { Bindable, resolved } from "@osucad/framework";
import { Slider } from "../../../hitObjects";
import type { IHitCircleToolPresence } from "../circle/HitCircleToolPresence";
import { HitCircleToolPresenceOverlay } from "../circle/HitCircleToolPresence";
import { EditorBeatmap } from "@osucad/editor";
import { SliderPathVisualizer } from "./SliderPathVisualizer";

export interface ISliderToolPresence extends IHitCircleToolPresence
{
  id: string | null;
}

export class SliderToolPresenceOverlay extends HitCircleToolPresenceOverlay
{
  constructor()
  {
    super();
  }

  @resolved(DrawableRuleset)
  accessor #drawableRuleset!: DrawableRuleset;

  @resolved(EditorBeatmap)
  accessor #editorBeatmap!: EditorBeatmap;

  private readonly slider = new Bindable<Slider | null>(null);

  #pathVisualizer?: SliderPathVisualizer;

  protected override loadComplete()
  {
    super.loadComplete();

    this.slider.bindValueChanged(slider =>
    {
      if (this.#pathVisualizer)
      {
        this.removeInternal(this.#pathVisualizer);
        this.#pathVisualizer = undefined;
      }

      if (slider.value)
        this.addInternal(this.#pathVisualizer = new SliderPathVisualizer(slider.value));
    });
  }

  override updatePresence(content: unknown): void
  {
    super.updatePresence(content);

    const { id } = content as ISliderToolPresence;

    const slider = id ? this.#editorBeatmap.runtime?.objects.getObject(id) : undefined;

    if (slider instanceof Slider)
      this.slider.value = slider;
    else
      this.slider.value= null;
  }
}
