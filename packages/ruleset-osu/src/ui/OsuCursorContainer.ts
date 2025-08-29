import { GameplayCursorContainer, SkinnableDrawable } from "@osucad/core";
import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";
import { OsuSkinComponents } from "../skinning/OsuSkinComponents";
import { OsuAction } from "./OsuAction";
import { OsuCursor } from "./OsuCursor";
import { CursorTrail } from "./CursorTrail";

export class OsuCursorContainer extends GameplayCursorContainer implements IKeyBindingHandler<OsuAction>
{
  readonly #cursorTrail: SkinnableDrawable;

  public constructor()
  {
    super();

    this.internalChild = new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        this.#cursorTrail = new SkinnableDrawable(OsuSkinComponents.CursorTrail),
        new SkinnableDrawable(OsuSkinComponents.CursorParticles),
      ],
    });
  }

  public declare activeCursor: OsuCursor;

  public override createCursor(): Drawable
  {
    return new OsuCursor();
  }

  #downCount = 0;

  #updateExpandedState()
  {
    if (this.#downCount > 0)
      this.activeCursor.expand();
    else
      this.activeCursor.contract();
  }

  public override update()
  {
    super.update();

    if (this.#cursorTrail.drawable instanceof CursorTrail)
    {
      this.#cursorTrail.drawable.newPartScale = this.activeCursor.currentExpandedScale;
    }
  }

  public readonly isKeyBindingHandler = true;

  public canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof OsuAction;
  }

  public onKeyBindingPressed(e: KeyBindingPressEvent<OsuAction>): boolean
  {

    switch (e.pressed)
    {
    case OsuAction.LeftButton:
    case OsuAction.RightButton:
      this.#downCount++;
      this.#updateExpandedState();
      break;
    }

    return false;
  }

  public onKeyBindingReleased(e: KeyBindingReleaseEvent<OsuAction>): boolean
  {

    switch (e.pressed)
    {
    case OsuAction.LeftButton:
    case OsuAction.RightButton:
      this.#downCount = Math.max(0, this.#downCount - 1);

      if(this.#downCount === 0)
        this.#updateExpandedState();
      break;
    }

    return false;
  }

  public override get handlePositionalInput(): boolean
  {
    return true;
  }

  protected override popIn()
  {
    super.popIn();
  }

  protected override popOut()
  {
    super.popOut();
  }
}
