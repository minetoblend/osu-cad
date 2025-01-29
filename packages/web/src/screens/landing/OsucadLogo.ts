import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { CompositeDrawable, DrawableSprite } from '@osucad/framework';
import { OsucadTextures } from '@osucad/resources';

export class OsucadLogo extends CompositeDrawable {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    OsucadTextures.logoText.load().then((texture) => {
      if (!texture)
        return;

      this.addInternal(new DrawableSprite({
        texture,
        width: 288,
        height: 96,
      }));
    });
  }
}
