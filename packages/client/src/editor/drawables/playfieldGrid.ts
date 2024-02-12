import {Graphics} from "pixi.js";
import {usePreferences} from "@/composables/usePreferences.ts";
import {Drawable} from "@/editor/drawables/Drawable.ts";
import {Preferences} from "@osucad/common";


export class PlayfieldGrid extends Drawable {

  private readonly graphics = new Graphics();


  constructor() {
    super();
    this.addChild(this.graphics);
  }

  onLoad() {
    const {preferences, loaded} = usePreferences();
    watchEffect(() => {
      if (!loaded.value) return;
      this.update(preferences)
    })
  }


  update(preferences: Preferences) {
    const g = this.graphics;
    const gridSize = 32;

    g.clear();

    g.roundRect(0, 0, 512, 384, 2);
    if (preferences.viewport.grid.enabled) {
      for (let x = gridSize; x < 512; x += gridSize) {
        if (x == 256) continue;
        g.moveTo(x, 0);
        g.lineTo(x, 384);
      }
      for (let y = gridSize; y < 384; y += gridSize) {
        if (y == 192) continue;
        g.moveTo(0, y);
        g.lineTo(512, y);
      }
    }

    g.stroke({
      width: 0.5,
      color: preferences.viewport.grid.color,
      alpha: preferences.viewport.grid.opacity / 100
    });

    if (preferences.viewport.grid.enabled) {
      g.moveTo(0, 192);
      g.lineTo(512, 192);
      g.moveTo(256, 0);
      g.lineTo(256, 384);
      g.stroke({
        width: 1,
        color: preferences.viewport.grid.color,
        alpha: preferences.viewport.grid.opacity / 100
      });
    }
  }
}