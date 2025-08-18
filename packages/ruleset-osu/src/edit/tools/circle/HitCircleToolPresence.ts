import { DrawableRuleset } from "@osucad/core";
import { ComposeToolPresenceOverlay, EditorBeatmap } from "@osucad/editor";
import type { Container, IVec2 } from "@osucad/framework";
import { Anchor, Axes, Box, CircularContainer, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { OsuHitObject } from "../../../hitObjects";
import { PlacementState } from "../HitObjectPlacementTool";

export interface IHitCircleToolPresence
{
  state: PlacementState
  position: IVec2
  startTime: number
}

export class HitCircleToolPresenceOverlay extends ComposeToolPresenceOverlay
{
  constructor()
  {
    super();
  }

  @resolved(DrawableRuleset)
  accessor #drawableRuleset!: DrawableRuleset

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#drawableRuleset.createPlayfieldAdjustmentContainer().with({
      child: this.#circle = new CircularContainer({
        origin: Anchor.Center,
        size: OsuHitObject.OBJECT_DIMENSIONS,
        masking: true,
        borderThickness: 2,
        borderColor: 0xffffff,
        child: new Box({ relativeSizeAxes: Axes.Both, alpha: 0, alwaysPresent: true }),
        alpha: 0,
      }),
    }));
  }

  #circle!: Container;

  override updatePresence(content: unknown): void
  {
    if (typeof content !== "object" || !content || !("position" in content))
    {
      this.#circle.hide();
      return;
    }

    const{ position, startTime, state } = content as IHitCircleToolPresence;

    if (state === PlacementState.Idle)
    {
      this.#circle.scale = this.#beatmap.difficulty.calculateCircleSize(true);
      this.#circle.moveTo(Vec2.from(position), 100);

      if (this.#circle.alpha === 0)
      {
        this.#circle.finishTransforms();
        this.#circle.show();
      }

    }
    else
    {
      this.#circle.hide();
    }
  }
}
