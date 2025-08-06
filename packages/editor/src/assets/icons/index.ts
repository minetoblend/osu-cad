import { loadTexture } from "@osucad/framework";
import mouseBlank from "./mouse-blank.png";
import mouseLeft from "./mouse-left.png";
import mouseMiddle from "./mouse-middle.png";
import mouseRight from "./mouse-right.png";
import select from"./select.png";

export const EditorIcons = {
  mouseBlank: await loadTexture(mouseBlank),
  mouseLeft: await loadTexture(mouseLeft),
  mouseMiddle: await loadTexture(mouseMiddle),
  mouseRight: await loadTexture(mouseRight),
  select: await loadTexture(select),
};
