import type { Drawable, KeyCombination } from "@osucad/framework";
import { Anchor, Axes, Box, CompositeDrawable, Container, DrawableSprite, FillDirection, FillFlowContainer, InputKey, loadTexture, SpriteText } from "@osucad/framework";
import type { Texture } from "pixi.js";

export class DrawableToolHotKey extends CompositeDrawable
{
  public constructor(public readonly keyCombinations: KeyCombination[], public readonly description: string)
  {
    super();

    this.autoSizeAxes = Axes.Both;

    this.internalChild = new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      direction: FillDirection.Horizontal,
      children: [
        ...keyCombinations.flatMap(it => it.keys).map(key =>
          createDrawableInputKey(key).with({ anchor: Anchor.CenterLeft, origin: Anchor.CenterLeft }),

        ),
        new SpriteText({
          text: description,
          margin: 4,
          style: {
            fill: 0xffffff,
            fontSize: 14,
          },
        }),
      ],
    });
  }
}

import mouseLeft from "./icons/mouse-left.png";
import mouseMiddle from "./icons/mouse-middle.png";
import mouseRight from "./icons/mouse-right.png";

function createDrawableInputKey(key: InputKey): Drawable
{
  let keyString = InputKey[key];

  switch(key)
  {
  case InputKey.MouseLeftButton:
    return createIcon(mouseLeft);
  case InputKey.MouseMiddleButton:
    return createIcon(mouseMiddle);
  case InputKey.MouseRightButton:
    return createIcon(mouseRight);
  case InputKey.Control:
    keyString = "Ctrl";
  }


  return new Container({
    autoSizeAxes: Axes.Both,
    masking: true,
    cornerRadius: 5,
    cornerExponent: 3,
    borderThickness: 2,
    borderColor: 0xffffff,
    children: [
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        alwaysPresent: true,
      }),
      new Container({ width: 20 }),
      new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        padding: 4,
        child: new SpriteText({
          text: keyString,
          style: {
            fill: 0xffffff,
            fontSize: 14,
          },
        }),
      }),
    ],
  });
}

const textures = new Map<string, Promise<Texture | null>>();

function createIcon(url: string): Drawable
{
  let textureP = textures.get(url);
  if (!textureP)
    textures.set(url, textureP = loadTexture(url));

  const container = new Container({
    autoSizeAxes: Axes.Both,
  });

  textureP.then(texture => container.add(new DrawableSprite({ texture, size: 24 })));

  return container;
}
