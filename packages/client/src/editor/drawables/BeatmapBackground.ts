import {Drawable} from "./Drawable.ts";
import {Inject} from "./di";
import {Assets, BlurFilter, Graphics, Point, Sprite} from "pixi.js";
import gsap from "gsap";
import {usePreferences} from "@/composables/usePreferences.ts";
import {EditorContext} from "@/editor/editorContext.ts";

export class BeatmapBackground extends Drawable {


  @Inject(EditorContext)
  editor!: EditorContext;

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
      const sprite = new Sprite({
        texture,
        position: {x: 256, y: 192},
        anchor: new Point(0.5, 0.5),
      });

      const scale = Math.max(853 / texture.width, 480 / texture.height) * 1.2;
      sprite.scale.set(scale * 1.3);

      this.addChild(sprite);

      gsap.to(sprite.scale, {
        x: scale,
        y: scale,
        duration: 1,
        ease: "power4.out",
      });

      const {preferences} = usePreferences();
      const blurFilter = new BlurFilter({
        quality: 10
      });


      watchEffect(() => {
        sprite.alpha = (100 - preferences.viewport.backgroundDim) / 100;
        blurFilter.blur = preferences.viewport.backgroundBlur;
        if (blurFilter.blur > 0)
          sprite.filters = [blurFilter];
        else
          sprite.filters = [];
      })

    } catch (e) {
    }
  }

}