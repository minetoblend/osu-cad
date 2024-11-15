import type { OsuPlayfield } from '@osucad/common';
import type { Drawable } from 'osucad-framework';
import { Container, EasingFunction, Vec2 } from 'osucad-framework';
import { EditorScreen } from './EditorScreen';

const key = Symbol('playfieldOwner');

export class EditorScreenUtils {
  static getPlayfieldOwner(playfield: OsuPlayfield) {
    return (playfield as any)[key] as EditorScreen | null;
  }

  static setPlayfieldOwner(playfield: OsuPlayfield, owner: EditorScreen | null) {
    (playfield as any)[key] = owner;
  }

  static insertPlayfield(playfield: OsuPlayfield, newParent: Container) {
    const oldParent = playfield.parent;

    newParent.onDispose(() => {
      if (playfield.parent === newParent)
        newParent.remove(playfield, false);
    });

    const owningScreen = newParent.findClosestParentOfType(EditorScreen);

    owningScreen?.exited.addListener(() => {
      if (playfield.parent === newParent)
        newParent.remove(playfield, false);
    });

    this.setPlayfieldOwner(playfield, owningScreen);

    if (!oldParent) {
      newParent.add(playfield);
      return;
    }

    if (!(oldParent instanceof Container)) {
      throw new TypeError('Cannot reparent a drawable that is not a child of a container');
    }

    oldParent.remove(playfield, false);

    newParent.add(playfield);
  }

  static matchScreenSpaceDrawQuad(source: Drawable, target: Drawable, animateToOriginalSize = false) {
    const sourceSize = source.drawSize;

    const screenSpaceTopLeft = source.toScreenSpace(new Vec2(0, 0));
    const screenSpaceBottomRight = source.toScreenSpace(sourceSize);

    const targetTopLeft = target.parent!.toLocalSpace(screenSpaceTopLeft);
    const targetBottomRight = target.parent!.toLocalSpace(screenSpaceBottomRight);

    const targetSize = targetBottomRight.sub(targetTopLeft);

    const originalPosition = target.position.clone();
    const originalScale = target.scale.clone();

    target.position = targetTopLeft;
    target.scale = targetSize.div(sourceSize);

    if (animateToOriginalSize) {
      target.moveTo(originalPosition, 500, EasingFunction.OutExpo);
      target.scaleTo(originalScale, 500, EasingFunction.OutExpo);
    }
  }
}
