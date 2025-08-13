import type { EditorRuntime } from "@osucad/editor";
import { EditorMultiplayerClient } from "@osucad/editor";
import type { Bindable, DragEndEvent, DragEvent, DragStartEvent, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, AudioManager, Axes, Box, CompositeDrawable, Container, DependencyContainer, dependencyLoader, FillDirection, FillFlowContainer, FramedClock, ManualClock, resolved, Screen, SpriteText, Vec2, ZipArchiveFileSystem } from "@osucad/framework";
import { PathPoint, type Slider } from "@osucad/ruleset-osu";
import { Color } from "pixi.js";
import oskFile from "./skin.osk?url";
import type { IResourcesProvider } from "@osucad/core";
import { BeatmapDifficultyInfo, LegacyBeatmapTiming, LegacyTimingPoint, PlayfieldClock, Skin, SkinProvidingContainer } from "@osucad/core";

export class MultiplayerTest extends Screen implements IResourcesProvider
{

  @resolved(AudioManager)
  accessor audioManager!: AudioManager;

  #dependencies!: DependencyContainer;

  override createChildDependencies(parentDependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  #skin!: Skin;
  #client!: EditorMultiplayerClient;

  @dependencyLoader()
  async #load()
  {
    this.addInternal(this.#client = new EditorMultiplayerClient());

    const loadingText = new SpriteText({
      text: "loading skin...",
      style: { fill: 0xffffff },
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    this.addInternal(loadingText);

    const files = await fetch(oskFile)
      .then(res => res.arrayBuffer())
      .then(data => ZipArchiveFileSystem.createMutable(data));

    this.#skin = new Skin(files, this);

    this.#skin.config.comboColors = [
      new Color("rgb(255,198,138)"),
      new Color("rgb(196,196,196)"),
      new Color("rgb(193,157,192)"),
    ];
    this.#skin.config.set("hitCircleOverlap", 66);

    this.removeInternal(loadingText);
  }

  override async loadComplete()
  {
    super.loadComplete();

    const rulesetSkin = await this.#client.runtime.ruleset.createSkinTransformer?.(skin);

    const clock = new ManualClock();
    clock.currentTime = -200;
    clock.isRunning =false;

    const framedClock = new FramedClock(clock);
    this.#dependencies.provide(PlayfieldClock, framedClock);

    const drawableRuleset = await this.#client.runtime.ruleset.createDrawableRuleset({ cursor: false });

    this.addInternal(new SkinProvidingContainer({
      skin: rulesetSkin ?? this.#skin,
      child: new Container({
        relativeSizeAxes: Axes.Both,
        clock: new FramedClock(clock),
        child: drawableRuleset,
      }),
    }));

    const slider = this.#client.editorBeatmap.hitObjects.hitObjects[0] as Slider;

    const difficulty = new BeatmapDifficultyInfo();
    difficulty.approachRate = 9;
    difficulty.circleSize = 4;

    const timing = new LegacyBeatmapTiming();
    const timingPoint = new LegacyTimingPoint();
    timingPoint.startTime = 0;
    timingPoint.timingInfo = { beatLength: 60000 / 180, signature: 4 };
    timing.add(timingPoint);

    slider.applyDefaults(difficulty, timing);

    drawableRuleset.addHitObject(slider);



    this.addInternal(drawableRuleset.createPlayfieldAdjustmentContainer().with({
      child: new MovableBox(slider, runtime),
    }));

    this.addInternal(new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      padding: 10,
      spacing: new Vec2(10),
      direction: FillDirection.Horizontal,
      children: [
        new Button("Undo", this.runtime.history.canUndoBindable, () => this.runtime.history.undo()),
        new Button("Redo", this.runtime.history.canRedoBindable, () => this.runtime.history.redo()),
      ],
    }));
  }
}

class Button extends CompositeDrawable
{
  constructor(text: string, readonly enabled: Bindable<boolean>, readonly action: () => void)
  {
    super();

    this.autoSizeAxes = Axes.Both;
    this.masking = true;
    this.cornerRadius = 5;
    this.internalChildren = [
      new Box({ relativeSizeAxes: Axes.Both, color: 0x222228 }),
      new SpriteText({
        text,
        margin: { horizontal: 20, vertical: 5 },
        style: {
          fill: 0xffffff,
        },
      }),
    ];

    enabled.bindValueChanged(e => this.alpha = e.value ? 1 : 0.5, true);
  }

  override onClick()
  {
    this.action();
    return true;
  }
}

class MovableBox extends CompositeDrawable
{
  constructor(readonly object: Slider, readonly runtime: EditorRuntime)
  {
    super();

    this.positionBindable = object.positionBindable.getBoundCopy();

    object.path.controlPoints.forEach((_, index) => this.addInternal(new PathHandle(object, index, runtime)));
  }

  positionBindable!: Bindable<Vec2>;

  protected override loadComplete()
  {
    super.loadComplete();

    this.positionBindable.bindValueChanged(pos => this.position = pos.value, true);
  }

  override onDragStart(e: DragStartEvent): boolean
  {
    return true;
  }

  override onDrag(ev: DragEvent): boolean
  {
    const delta = this.parent!.toLocalSpace(ev.screenSpaceMousePosition).sub(this.parent!.toLocalSpace(ev.screenSpaceLastMousePosition));

    this.object.moveBy(delta.x, delta.y);

    return true;
  }

  override onDragEnd(ev: DragEndEvent)
  {
    this.runtime.history.commit();
  }
}

class PathHandle extends CompositeDrawable
{
  constructor(readonly slider: Slider, readonly index: number, readonly runtime: EditorRuntime)
  {
    super();

    this.origin = Anchor.Center;
    this.size = new Vec2(10);
    this.internalChild = new Box({ relativeSizeAxes: Axes.Both });

    slider.path.version.bindValueChanged(() =>
    {
      this.position = slider.path.controlPoints[index].position;
    }, true);
  }

  override onDragStart(e: DragStartEvent): boolean
  {
    return true;
  }

  override onDrag(ev: DragEvent): boolean
  {
    const delta = this.parent!.toLocalSpace(ev.screenSpaceMousePosition).sub(this.parent!.toLocalSpace(ev.screenSpaceLastMousePosition));

    const path = [...this.slider.path.controlPoints];

    if (this.index === 0)
    {
      this.slider.moveBy(delta.x, delta.y);

      for (let i = 1; i < path.length; i++)
        path[i] = new PathPoint(path[i].position.sub(delta), path[i].type);
    }
    else
    {
      path[this.index] = new PathPoint(path[this.index].position.add(delta), path[this.index].type);
    }

    this.slider.path.controlPoints = path;
    this.slider.path.expectedDistance = this.slider.path.calculatedDistance;

    return true;
  }

  override onDragEnd(ev: DragEndEvent)
  {
    this.runtime.history.commit();
  }
}
