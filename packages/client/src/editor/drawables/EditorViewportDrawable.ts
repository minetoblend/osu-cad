import {Drawable} from "./Drawable.ts";
import {ISize} from "@osucad/common";
import {ScaleToFitContainer} from "./scaleToFitContainer.ts";
import {VIEWPORT_SIZE} from "./injectionKeys.ts";
import {PlayfieldGrid} from "./playfieldGrid.ts";
import {Provide} from "./di";
import {Container, Point} from "pixi.js";
import {BeatmapBackground} from "./BeatmapBackground.ts";
import {HitObjectContainer} from "./hitObjects/HitObjectContainer.ts";
import {BeatInfo} from "../beatInfo.ts";
import {EditorClock} from "../clock.ts";
import {ToolContainer} from "../tools/ToolContainer.ts";
import {CursorContainer} from "./CursorContainer.ts";
import {VolumeControlOverlay} from "./VolumeControlOverlay.ts";
import {AudioManager} from "../audio/AudioManager.ts";
import {HitSoundPlayer} from "../audio/HitSoundPlayer.ts";
import {PopoverContainer} from "./menu/PopoverContainer.ts";
import {seekInteraction} from "../interaction/Seek.ts";
import {AxisContainer} from "../AxisContainer.ts";
import {usePreferences} from "@/composables/usePreferences.ts";
import {EditorContext} from "@/editor/editorContext.ts";

export class EditorViewportDrawable extends Drawable {

  @Provide(VIEWPORT_SIZE)
  private readonly canvasSize: ISize;

  readonly playfieldContainer: ScaleToFitContainer;

  private readonly editor: EditorContext;

  @Provide(PopoverContainer)
  private readonly popoverContainer = new PopoverContainer();

  @Provide(BeatInfo)
  private readonly beatInfo = new BeatInfo();

  @Provide(AxisContainer)
  private readonly axisContainer = new AxisContainer();

  constructor(
      canvasSize: ISize,
      editor: EditorContext,
  ) {
    super();
    this.editor = editor;
    this.canvasSize = canvasSize;

    this.playfieldContainer = new ScaleToFitContainer(this.canvasSize, {width: 512, height: 384 + 40}, 40, false);
  }

  @Provide(HitObjectContainer)
  private hitObjectContainer = new HitObjectContainer();
  @Provide(ToolContainer)
  private toolContainer = new ToolContainer();

  onLoad() {
    this.provide(EditorContext, this.editor);
    this.provide(EditorClock, this.editor.clock);
    this.provide(AudioManager, this.editor.audioManager);

    const {preferences} = usePreferences()

    useEventListener("keydown", evt => {
      if (evt.ctrlKey && evt.key === "s") {
        evt.preventDefault();
      }
    })

    this.addChild(this.popoverContainer);

    this.popoverContainer.content.addChild(
        this.beatInfo,
        this.editor.clock,
        new HitSoundPlayer(),
        this.playfieldContainer,
        new VolumeControlOverlay()
    );

    seekInteraction(this.editor.clock, this.editor.beatmapManager, this.editor.selection, this.beatInfo, this);

    const playfield = this.playfield = new Container({
      children: [
        new PlayfieldGrid(),
        this.hitObjectContainer,
        new CursorContainer(),
      ],
      position: new Point(256, 192),
      pivot: new Point(256, 192),
    });


    const scaleContainer = new Container({
      position: new Point(256, 192),
      pivot: new Point(256, 192),
    })

    watchEffect(() => {
      scaleContainer.scale.set(preferences.viewport.playfieldScale / 100);
    })

    scaleContainer.addChild(new BeatmapBackground(), playfield, this.toolContainer, this.axisContainer)
    this.playfieldContainer.content.addChild(scaleContainer)

  }

  playfield!: Container;
}