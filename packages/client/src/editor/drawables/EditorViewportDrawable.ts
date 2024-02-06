import {Drawable} from "./Drawable.ts";
import {ISize} from "@osucad/common";
import {ScaleToFitContainer} from "./scaleToFitContainer.ts";
import {VIEWPORT_SIZE} from "./injectionKeys.ts";
import {PlayfieldGrid} from "./playfieldGrid.ts";
import {Provide} from "./di";
import {Container, Point} from "pixi.js";
import {TimelineDrawable} from "./timeline/TimelineDrawable.ts";
import {EditorInstance} from "../editorClient.ts";
import {BeatmapBackground} from "./BeatmapBackground.ts";
import gsap from "gsap";
import {HitObjectContainer} from "./hitObjects/HitObjectContainer.ts";
import {BeatInfo} from "../beatInfo.ts";
import {EditorClock} from "../clock.ts";
import {ToolContainer} from "../tools/ToolContainer.ts";
import {SelectTool} from "../tools/SelectTool.ts";
import {Toolbar} from "../tools/Toolbar.ts";
import {CursorContainer} from "./CursorContainer.ts";
import {VolumeControlOverlay} from "./VolumeControlOverlay.ts";
import {AudioManager} from "../audio/AudioManager.ts";
import {HitSoundPlayer} from "../audio/HitSoundPlayer.ts";
import {PopoverContainer} from "./menu/PopoverContainer.ts";
import {seekInteraction} from "../interaction/Seek.ts";
import {AxisContainer} from "../AxisContainer.ts";
import {usePreferences} from "@/composables/usePreferences.ts";

export class EditorViewportDrawable extends Drawable {

  @Provide(VIEWPORT_SIZE)
  private readonly canvasSize: ISize;

  private readonly transformContainer = new Container();
  readonly playfieldContainer: ScaleToFitContainer;

  private readonly editor: EditorInstance;

  @Provide(PopoverContainer)
  private readonly popoverContainer = new PopoverContainer();

  @Provide(BeatInfo)
  private readonly beatInfo = new BeatInfo();

  @Provide(AxisContainer)
  private readonly axisContainer = new AxisContainer();

  constructor(
      canvasSize: ISize,
      editor: EditorInstance,
  ) {
    super();
    this.editor = editor;
    this.canvasSize = canvasSize;

    const t = window.location.search.includes("hitsounds");

    this.playfieldContainer = new ScaleToFitContainer(reactiveComputed(() => {
      const size = {...this.canvasSize};
      if (t)
        size.height -= 400;



      return size;
    }), {width: 512, height: 384 + 40}, 40, false);
  }

  @Provide(HitObjectContainer)
  private hitObjectContainer = new HitObjectContainer();
  @Provide(ToolContainer)
  private toolContainer = new ToolContainer(new SelectTool());

  onLoad() {
    this.provide(EditorInstance, this.editor);
    this.provide(EditorClock, this.editor.clock);
    this.provide(AudioManager, this.editor.audioManager);

    const {preferences} = usePreferences()

    useEventListener("keydown", evt => {
      if (evt.ctrlKey && evt.key === "s") {
        evt.preventDefault();
      }
    })

    this.transformContainer.position.set(0, -100);
    gsap.to(this.transformContainer.position, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power4.out",
    });
    // const transformAlpha = new AlphaFilter({ alpha: 0 });
    // this.transformContainer.filters = [transformAlpha];
    // this.transformContainer.alpha = 0;

    gsap.to(this.transformContainer, {
      alpha: 1,
      duration: 1,
      ease: "power4.out",
    });

    const timelineContainer = new Container({
      children: [new TimelineDrawable()],
      y: 100,
      alpha: 0,
    });
    const toolbar = new Toolbar();

    this.addChild(this.popoverContainer);

    this.popoverContainer.content.addChild(
        this.beatInfo, this.editor.clock, new HitSoundPlayer(), this.transformContainer, toolbar, timelineContainer, new VolumeControlOverlay(),
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
    this.transformContainer.addChild(this.playfieldContainer);
    gsap.to(timelineContainer, {
      y: 0,
      alpha: 1,
      duration: 1,
      ease: "power4.out",
    });

    // const playfieldSize = new Vec2(512, 384);
    // const minSide = Math.min(playfieldSize.x, playfieldSize.y);
    // const maxSide = Math.max(playfieldSize.x, playfieldSize.y);
    // const scale = minSide / maxSide;
    // playfield.scale.set(scale);

    // playfield.position.set(
    //   (playfieldSize.x - playfieldSize.x * scale) / 2,
    //   (playfieldSize.y - playfieldSize.y * scale) / 2,
    // );

    // playfield.pivot.set(playfieldSize.x / 2, playfieldSize.y / 2);
    // playfield.position.set(playfieldSize.x / 2, playfieldSize.y / 2);


  }

  onTick() {
//    this.playfield.angle = 360 * this.editor.clock.currentTimeAnimated / 60000 * 12;
  }

  playfield!: Container;


}