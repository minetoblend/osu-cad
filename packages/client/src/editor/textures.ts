import {Assets, AssetsManifest} from "pixi.js";
import {skinBundle} from "./assets/skin.ts";
import {withBasePath} from "./assets/basePath.ts";


const manifest: AssetsManifest = {
  bundles: [
    skinBundle("skin"),
    withBasePath("ui", {
      name: "ui",
      assets: [
        {
          alias: "timeline-tick",
          src: "timeline-tick.png",
        },
        {
          alias: "sliderpath-handle",
          src: "sliderpath-handle.png",
        },
        {
          alias: "play",
          src: "play.png",
        },
        {
          alias: "pause",
          src: "pause.png",
        },
        {
          alias: "hitsound-layer-toggle",
          src: "hitsound-layer-toggle.png",
        },
        {
          alias: "hitsample",
          src: "hitsample.png",
        },
        {
          alias: "hitsample-outline",
          src: "hitsample-outline.png",
        },
      ],
    }),
    withBasePath("icons", {
      name: "icons",
      assets: [
        {
          alias: "icon-select",
          src: "select.png",
        },
        {
          alias: "icon-circle",
          src: "circle.png",
        },
        {
          alias: "icon-slider",
          src: "slider.png",
        },
        {
          alias: "icon-spinner",
          src: "spinner.png",
        },
      ],
    }),

  ],
};

export async function createEditorTextures() {
  Assets.reset();
  await Assets.init({
    // basePath: 'https://api.osucad.com/src/assets',
    basePath: new URL("../assets/", import.meta.url).href,
    manifest,
  });
  await Assets.loadBundle(["ui", "osu-skin", "icons"]);

}