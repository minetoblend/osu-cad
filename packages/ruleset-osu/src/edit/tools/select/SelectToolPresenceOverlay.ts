import { ComposeToolPresenceOverlay } from "@osucad/editor";
import { dependencyLoader, DrawableSprite, type IVec2, loadTexture, resolved, Vec2 } from "@osucad/framework";
import type { Texture } from "pixi.js";
import iconUrl from "./select.png";
import { DrawableRuleset } from "@osucad/core";

export interface ISelectToolPresence
{
  position: IVec2;
}

let icon: Promise<Texture | null> | undefined;

export class SelectToolPresenceOverlay extends ComposeToolPresenceOverlay
{
  constructor()
  {
    super();
  }

  #cursor!: DrawableSprite;

  @resolved(DrawableRuleset)
  accessor #drawableRuleset!: DrawableRuleset;

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#drawableRuleset.createPlayfieldAdjustmentContainer()
      .withChild(this.#cursor = new DrawableSprite({ scale: 0.5 })));

    icon ??= loadTexture(iconUrl);

    icon.then(texture =>
    {
      if (texture)
      {
        this.#cursor.texture = texture;
        this.#cursor.size = new Vec2(texture.width, texture.height);
      }
    });
  }

  override updatePresence(content: unknown): void
  {
    const { position } = content as ISelectToolPresence;

    this.#cursor.moveTo(Vec2.from(position), 100);
  }
}
