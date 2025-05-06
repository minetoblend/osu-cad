import type { IResourcesProvider } from "@osucad/core";
import { AudioMixer, BeatmapParser, Skin, SkinProvidingContainer } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager, Container, resolved, SimpleFileSystem, ZipArchiveFileSystem } from "@osucad/framework";
import type { StoryDrawable } from "@osucad/storybook-renderer";
import type { Beatmap } from "@osucad/core";
import { PlayfieldClock } from "@osucad/core";
import type { StopwatchClock } from "@osucad/framework";
import { Axes, CompositeDrawable, FramedClock, provide } from "@osucad/framework";

import "../../init";

import oskFile from "./skin.osk?url";
import osufile from "./test.osu?raw";
import { Color } from "pixi.js";

export interface SkinArgs
{
  comboColor1: string;
  comboColor2: string;
  comboColor3: string;
  hitcircle?: string[]
}

export class SkinningStory extends Container implements IResourcesProvider, StoryDrawable<SkinArgs>
{
  @resolved(AudioManager)
  audioManager!: AudioManager;

  audioMixer!: AudioMixer;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.audioMixer = new AudioMixer(this.audioManager);

    void this.setup();
  }

  async setup()
  {
    const zipFile = await fetch(oskFile)
      .then(res => res.arrayBuffer())
      .then(data => ZipArchiveFileSystem.createMutable(data));

    const files = new SimpleFileSystem();

    await Promise.all(
        zipFile.entries().map(async file => files.create(file.path, await file.read())),
    );

    this.files = files;


    const beatmap = await new BeatmapParser().parse(osufile);

    const skin = new Skin(files, this);

    this.skin = skin;

    if (this.skinArgs)
      this.updateSkin(this.skin, this.skinArgs);

    const osuSkin = await beatmap.beatmapInfo.ruleset?.createSkinTransformer?.(skin);

    this.add(this.skinProvidingContainer = new SkinProvidingContainer({
      skin: osuSkin ?? skin,
      child: new SkinVisualization(beatmap),
    }));
  }

  skin?: Skin;

  skinArgs?: SkinArgs;

  skinProvidingContainer?: SkinProvidingContainer;

  files!: SimpleFileSystem;

  updateArgs(args: SkinArgs)
  {
    this.skinArgs = args;

    if (this.skin)
      this.updateSkin(this.skin, args);

    if (this.skinProvidingContainer)
      this.skinProvidingContainer.sourceChanged.emit();
  }

  updateSkin(skin: Skin, args: SkinArgs)
  {
    skin.config.comboColors = [
      new Color(args.comboColor1),
      new Color(args.comboColor2),
      new Color(args.comboColor3),
    ];

    if (args.hitcircle?.length)
    {
      fetch(args.hitcircle[0])
        .then(res => res.arrayBuffer())
        .then(data =>
        {
          if (this.files.get("hitcircle@2x.png"))
            this.files.update("hitcircle@2x.png", data);
          else
            this.files.create("hitcircle@2x.png", data);
        });
    }
  }
}


export class SkinVisualization extends CompositeDrawable
{
  constructor(readonly beatmap: Beatmap)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.gameplayClock.seek(this.startTime);

    void this.loadRuleset();
  }

  @provide(PlayfieldClock)
  protected readonly gameplayClock = new LoopingClock();

  get startTime()
  {
    return this.beatmap.hitObjects[0].startTime - 1000;
  }

  get beatmapDuration()
  {
    return this.beatmap.hitObjects[this.beatmap.hitObjects.length - 1].startTime + 1000;
  }

  public override update()
  {
    super.update();

    this.gameplayClock.processFrame();

    if (this.gameplayClock.currentTime > this.beatmapDuration)
      this.gameplayClock.seek(this.startTime);
  }

  async loadRuleset()
  {
    const drawableRuleset = await this.beatmap.beatmapInfo.ruleset?.createDrawableRuleset();
    if (drawableRuleset)
    {
      this.addInternal(drawableRuleset);

      for (const hitObject of this.beatmap.hitObjects)
        drawableRuleset.addHitObject(hitObject);
    }
  }
}

class LoopingClock extends FramedClock
{
  constructor()
  {
    super();
  }

  public seek(value: number)
  {
    (this.source as StopwatchClock).seek(value);
    super.currentTime = this.lastFrameTime = value;
  }
}
