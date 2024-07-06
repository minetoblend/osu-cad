import {
  Anchor,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  resolved,
} from 'osucad-framework';
import { EditorSelection } from './EditorSelection';
import { HitObject, Slider, Spinner } from '@osucad/common';
import { Skin } from '../../../skins/Skin';

export class SelectionOverlay extends CompositeDrawable {
  @resolved(EditorSelection)
  selection!: EditorSelection;

  #objects = new Map<HitObject, SelectionOverlayObject>();

  @dependencyLoader()
  load() {
    this.selection.selectionChanged.addListener(([hitObject, selected]) => {
      if (selected && !this.#objects.has(hitObject)) {
        const overlay = new SelectionOverlayObject(hitObject);
        this.#objects.set(hitObject, overlay);
        this.addInternal(overlay);
      } else if (!selected && this.#objects.has(hitObject)) {
        const overlay = this.#objects.get(hitObject)!;
        this.removeInternal(overlay);
        this.#objects.delete(hitObject);
      }
    });
  }
}

class SelectionOverlayObject extends CompositeDrawable {
  constructor(readonly hitObject: HitObject) {
    super();
  }

  @resolved(Skin)
  skin!: Skin;

  @dependencyLoader()
  load() {
    this.hitObject.onUpdate.addListener(this.#onUpdate);

    if (this.hitObject instanceof Spinner) {
      return;
    }

    this.addInternal(
      (this.#startCircle = new DrawableSprite({
        texture: this.skin.hitcircleSelect,
        scale: this.hitObject.scale,
        origin: Anchor.Center,
      })),
    );

    if (this.hitObject instanceof Slider) {
      this.addInternal(
        (this.#endCircle = new DrawableSprite({
          texture: this.skin.hitcircleSelect,
          scale: this.hitObject.scale,
          origin: Anchor.Center,
        })),
      );
    }

    this.#onUpdate();
  }

  #startCircle?: DrawableSprite;
  #endCircle?: DrawableSprite;

  #onUpdate = () => {
    this.position = this.hitObject.stackedPosition;

    this.drawNode.zIndex = -this.hitObject.startTime;

    if (this.#startCircle) {
      this.#startCircle.scale = this.hitObject.scale;
    }

    if (this.#endCircle) {
      this.#endCircle.position = this.hitObject.endPosition.sub(
        this.hitObject.position,
      );
      this.#endCircle.scale = this.hitObject.scale;
    }
  };
}
