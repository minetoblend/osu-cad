import type { ValueChangedEvent } from "@osucad/framework";
import { Anchor, Axes, DrawableSprite, FillMode } from "@osucad/framework";
import { Bindable, CompositeDrawable, dependencyLoader, loadTexture, resolved } from "@osucad/framework";
import type { Texture } from "pixi.js";
import { EditorFileReference } from "./EditorFileReference";
import { EditorBeatmap } from "./runtime";
import type { BlobHandle } from "@osucad/multiplayer-core";
import type { RemoteFile } from "./runtime/dds/RemoteFileSystem";

export class EditorBackground extends CompositeDrawable
{
  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  private backgroundTexture!: EditorFileReference<Texture | null>;
  #currentBackground?: DrawableSprite;

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;
    this.alpha = 0.25;

    this.backgroundTexture = new EditorFileReference(
        this.#beatmap.fileSystem,
        this.#beatmap.beatmapInfo.backgroundFileBindable,
        data => loadTexture(data),
    );
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.backgroundTexture.bindValueChanged(e =>
    {
      this.#currentBackground?.fadeOut(200).expire();
      this.#currentBackground = undefined;

      if (e.value)
      {
        this.addInternal(this.#currentBackground = new DrawableSprite({
          texture: e.value,
          relativeSizeAxes: Axes.Both,
          fillMode: FillMode.Fill,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }));

        this.#currentBackground.fadeInFromZero(200);
      }
    }, true);
  }


}
