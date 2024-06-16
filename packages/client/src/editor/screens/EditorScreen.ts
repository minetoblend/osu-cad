import { Axes } from "../../framework/drawable/Axes";
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from "../../framework/drawable/ContainerDrawable";

export class EditorScreen extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  
}
