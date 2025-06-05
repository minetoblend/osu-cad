import type { ISkinSource } from "@osucad/core";
import { SkinnableDrawable, SkinReloadableDrawable } from "@osucad/core";
import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Container, Vec2 } from "@osucad/framework";
import type { SkinnableCursor } from "./SkinnableCursor";
import { OsuSkinComponents } from "../skinning/OsuSkinComponents";

export class OsuCursor extends SkinReloadableDrawable
{
  public static readonly SIZE = 20;

  #cursorExpand = false;

  #cursorSprite!: SkinnableDrawable;

  protected override skinChanged(skin: ISkinSource)
  {
    super.skinChanged(skin);

    this.#cursorExpand = skin.getConfig("cursorExpand") ?? true;
  }

  get #skinnableCursor(): SkinnableCursor
  {
    return this.#cursorSprite.drawable as SkinnableCursor;
  }

  get currentExpandedScale(): Vec2
  {
    return this.#skinnableCursor.expandTarget?.scale ?? Vec2.one();
  }

  get currentRotation()
  {
    return this.#skinnableCursor.expandTarget?.rotation ?? 0;
  }

  public constructor()
  {
    super();

    this.origin= Anchor.Center;
    this.size = new Vec2(OsuCursor.SIZE);
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChild = this.createCursorContent();
  }

  private createCursorContent(): Drawable
  {
    return new Container({
      relativeSizeAxes: Axes.Both,
      origin: Anchor.Center,
      anchor: Anchor.Center,
      child: this.#cursorSprite = new SkinnableDrawable(OsuSkinComponents.Cursor).with({
        origin: Anchor.Center,
        anchor: Anchor.Center,
      }),
    });
  }

  public expand()
  {
    if (!this.#cursorExpand)
      return;

    this.#skinnableCursor.expand();
  }

  public contract()
  {
    this.#skinnableCursor.contract();
  }
}

