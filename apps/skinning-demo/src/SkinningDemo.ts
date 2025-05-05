import "@osucad/ruleset-osu/init";
import { BeatmapParser, Skin, SkinProvidingContainer } from "@osucad/core";

import { Game, ReadonlyDependencyContainer, ZipArchiveFileSystem } from "@osucad/framework";
import { Color } from "pixi.js";
import oskFile from "./skin.osk?url";
import { SkinVisualization } from "./SkinVisualization";
import osufile from "./test.osu?raw";

export class SkinningDemo extends Game 
{
  constructor() 
  {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) 
  {
    super.load(dependencies);

    void this.setupSkinVisualizer();
  }

  async setupSkinVisualizer() 
  {
    const files = await fetch(oskFile)
      .then(res => res.arrayBuffer())
      .then(data => ZipArchiveFileSystem.createMutable(data));

    const beatmap = await new BeatmapParser().parse(osufile);

    const skin = new Skin(files);

    skin.config.set("sliderTrackOverride", new Color("black"));
    skin.config.set("sliderBorder", new Color("rgb(50,50,50)"));

    setInterval(() => 
    {
      skin.config.set("sliderBorder", new Color([
        Math.random(),
        Math.random(),
        Math.random(),
      ]));
      skin.config.set("sliderTrackOverride", new Color([
        Math.random(),
        Math.random(),
        Math.random(),
      ]));
    }, 1000);

    skin.config.comboColors = [
      new Color("rgb(0,206,209)"),
      new Color("rgb(32,178,170)"),
      new Color("rgb(64,224,208)"),
      new Color("rgb(0,255,255)"),
      new Color("rgb(0,191,255)"),
    ];

    const osuSkin = await beatmap.beatmapInfo.ruleset?.createSkinTransformer?.(skin);

    this.add(new SkinProvidingContainer({
      skin: osuSkin ?? skin,
      child: new SkinVisualization(beatmap),
    }));
  }
}
