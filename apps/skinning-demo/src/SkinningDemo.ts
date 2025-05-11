import "@osucad/ruleset-osu/init";
import { BeatmapParser, OsucadGameBase, Skin, SkinProvidingContainer } from "@osucad/core";

import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { ZipArchiveFileSystem } from "@osucad/framework";
import { Color } from "pixi.js";
import oskFile from "./skin.osk?url";
import { SkinVisualization } from "./SkinVisualization";
import osufile from "./test.osu?raw";
import { PerformanceOverlay } from "./PerformanceOverlay";

export class SkinningDemo extends OsucadGameBase
{
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

    const skin = new Skin(files, this);

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

    this.add(new PerformanceOverlay());
  }
}
