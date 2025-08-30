import { ISkinSource, SkinnableSpriteText } from "@osucad/core";
import { Anchor, Axes, Bindable, CompositeDrawable, dependencyLoader, DrawableSprite, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { OsuTimelineBlueprint } from "../../edit/timeline/OsuTimelineBlueprint";
import { OsuHitObject } from "../../hitObjects";
import { OsuSkinComponents } from "../OsuSkinComponents";

export class LegacyTimelineCirclePiece extends CompositeDrawable
{
  public constructor(private readonly hasNumber = true)
  {
    super();
  }

  @resolved(ISkinSource)
  accessor #skin!: ISkinSource;

  @resolved(OsuTimelineBlueprint)
  accessor #blueprint!: OsuTimelineBlueprint

  #circleSprite!: DrawableSprite;
  #circleText?: SkinnableSpriteText;

  protected readonly accentColor = new Bindable(new Color(0xffffff));

  protected readonly indexInComboBindable = new Bindable(0);

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;

    this.accentColor.bindTo(this.#blueprint.accentColor);
    this.indexInComboBindable.bindTo(this.#blueprint.indexInComboBindable);

    const maxSize = OsuHitObject.OBJECT_DIMENSIONS.scale(2);

    this.internalChildren = [
      this.#circleSprite = new DrawableSprite({
        texture: this.#skin.getTexture("hitcircle")?.withMaximumSize(maxSize),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      new DrawableSprite({
        texture: this.#skin.getTexture("hitcircleoverlay")?.withMaximumSize(maxSize),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];

    if (this.hasNumber)
    {
      this.addInternal(this.#circleText = new SkinnableSpriteText(OsuSkinComponents.HitCircleText).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));

      this.indexInComboBindable.bindValueChanged(e => this.#circleText!.text = (e.value + 1).toString(), true);
    }
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.accentColor.bindValueChanged(e => this.#circleSprite.color = e.value, true);
  }
}
