import {Drawable} from "./Drawable.ts";
import {Inject} from "./di";
import {EditorInstance} from "../editorClient.ts";
import {Assets, Graphics, Point, Sprite} from "pixi.js";
import gsap from "gsap";

export class BeatmapBackground extends Drawable {


  @Inject(EditorInstance)
  editor!: EditorInstance;

  mask = new Graphics()
    .roundRect(0, 0, 512, 384, 2)
    .fill(0xffffff);

  onLoad() {
    // this.addChild(this.mask);
    this.loadBackground();
  }

  async loadBackground() {
    try {
      const beatmapManager = this.editor.beatmapManager;
      const texture = await Assets.load(`/api/mapsets/${beatmapManager.beatmap.setId}/files/${beatmapManager.beatmap.backgroundPath}`);
      const blurredSprite = new Sprite({
        texture,
        position: { x: 256, y: 192 },
        anchor: new Point(0.5, 0.5),
        tint: 0x333333,
      });
      const sprite = new Sprite({
        texture,
        position: { x: 256, y: 192 },
        anchor: new Point(0.5, 0.5),
        tint: 0x777777,
      });

      const scale = Math.max(853 / texture.width, 480 / texture.height) * 1.2;
      sprite.scale.set(scale * 1.3);
      blurredSprite.scale.set(scale * 1.3);

      this.addChild(sprite);

      gsap.to(sprite.scale, {
        x: scale,
        y: scale,
        duration: 1,
        ease: "power4.out",
      });
      gsap.to(blurredSprite.scale, {
        x: scale,
        y: scale,
        duration: 1,
        ease: "power4.out",
      });
      //sprite.mask = this.mask;
    } catch (e) {
    }
  }

}