import "@osucad/ruleset-osu/init";
import { IResourcesProvider } from "@osucad/core";
import { AudioMixer } from "@osucad/core";
import { BeatmapParser, Skin, SkinProvidingContainer } from "@osucad/core";

import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager } from "@osucad/framework";
import { Game, provide, resolved, ZipArchiveFileSystem } from "@osucad/framework";
import { Color } from "pixi.js";
import oskFile from "./skin.osk?url";
import { SkinVisualization } from "./SkinVisualization";
import osufile from "./test.osu?raw";

@provide(IResourcesProvider)
export class SkinningDemo extends Game implements IResourcesProvider
{
  constructor()
  {
    super();
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  audioMixer!: AudioMixer;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.audioMixer = new AudioMixer(this.audioManager);

    void this.setupSkinVisualizer();
  }

  async setupSkinVisualizer()
  {
    const files = await fetch(oskFile)
      .then(res => res.arrayBuffer())
      .then(data => ZipArchiveFileSystem.createMutable(data));

    const beatmap = await new BeatmapParser().parse(osufile);

    const skin = new Skin(files, this);

    skin.config.set("sliderBallFlip", false);
    skin.config.set("hitCircleOverlap", 66);
    skin.config.set("scoreOverlap", 6);
    skin.config.set("comboOverlap", 50);
    skin.config.set("sliderBorder", new Color("rgb(255,181,102)"));
    skin.config.set("sliderTrackOverride", new Color("rgb(35,24,11)"));

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
      new Color("rgb(255,198,138)"),
      new Color("rgb(196,196,196)"),
      new Color("rgb(193,157,192)"),
    ];

    const osuSkin = await beatmap.beatmapInfo.ruleset?.createSkinTransformer?.(skin);

    this.add(new SkinProvidingContainer({
      skin: osuSkin ?? skin,
      child: new SkinVisualization(beatmap),
    }));
  }
}
