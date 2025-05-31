import { SkinnableDrawable } from "./SkinnableDrawable";
import type { SkinComponentLookup } from "./SkinComponentLookup";
import type { SpriteText } from "@osucad/framework";

export class SkinnableSpriteText extends SkinnableDrawable
{

  constructor(lookup: SkinComponentLookup, defaultImplementation?: () => SpriteText)
  {
    super(lookup, defaultImplementation);
  }

  protected override onSkinChanged()
  {
    super.onSkinChanged();

    if ("text" in this.drawable)
      this.drawable.text = this.text;
  }

  #text = "";

  get text()
  {
    return this.#text;
  }

  set text(value: string)
  {
    if(this.#text === value)
      return;

    this.#text = value;
    if ("text" in this.drawable)
      this.drawable.text = value;
  }
}
