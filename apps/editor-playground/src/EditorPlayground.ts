import { BeatmapParser, OsucadGameBase, Skin, SkinProvidingContainer } from "@osucad/core";
import { ZipArchiveFileSystem, type ReadonlyDependencyContainer } from "@osucad/framework";
import oskFile from "./skin.osk?url";
import osufile from "./test.osu?raw";
import { Color } from "pixi.js";
import { Editor } from "@osucad/editor";
import "@osucad/ruleset-osu/init";

export class EditorPlayground extends OsucadGameBase
{
  constructor()
  {
    super();
  }

  protected override get hasAsyncLoader(): boolean
  {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer)
  {
    await super.loadAsync(dependencies);


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
    skin.config.set("hitCircleOverlap", 66);

    const osuSkin = await beatmap.beatmapInfo.ruleset?.createSkinTransformer?.(skin);

    this.add(new SkinProvidingContainer({
      skin: osuSkin ?? skin,
      child: new Editor({
        beatmap,
      }),
    }));
  }
}
