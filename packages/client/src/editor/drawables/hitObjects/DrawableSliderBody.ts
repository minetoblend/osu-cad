import {Drawable} from "../Drawable.ts";
import {Mesh} from "pixi.js";
import {Slider} from "@osucad/common";
import {SliderPathGeometry} from "./SliderPathGeometry.ts";
import {animate} from "../animate.ts";
import {Inject} from "../di";
import {EditorClock} from "../../clock.ts";
import {SliderShader} from "./sliderShader.ts";
import {SliderFilter} from "./SliderFilter.ts";
import {usePreferences} from "@/composables/usePreferences.ts";
import {EditorContext} from "@/editor/editorContext.ts";

export class DrawableSliderBody extends Drawable {

  private readonly mesh: Mesh;

  private readonly geometry: SliderPathGeometry;

  private readonly shader = new SliderShader();
  private readonly filter = new SliderFilter();

  constructor(
      private readonly hitObject: Slider,
  ) {
    super();


    const path = hitObject.path;

    this.mesh = new Mesh({
      geometry: this.geometry = new SliderPathGeometry({path: path.calculatedRange, radius: this.radius}),
      shader: this.shader,
    });

    this.mesh.state.depthTest = true;
    this.addChild(this.mesh);

    this.mesh.filters = [this.filter];
  }

  get radius() {
    return this.hitObject.scale * 60 * 1.25;
  }

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  @Inject(EditorClock)
  private readonly clock!: EditorClock;

  get path() {
    return this.hitObject.path;
  }

  snakingSlidersEnabled = true;

  onLoad() {
    const {preferences} = usePreferences();
    watchEffect(() => {
      this.snakingSlidersEnabled = preferences.viewport.snakingSliders;
    })
  }

  setup() {
    const comboColors = this.editor.beatmapManager.beatmap.colors;
    this.filter.comboColor = comboColors[this.hitObject.comboIndex % comboColors.length];
    this.filter.borderColor = this.hitObject.isSelected ? 0x3d74ff : 0xffffff;
  }

  pathVersion = -1;

  onTick() {
    if (
        (this.editor.clock.currentTimeAnimated < this.hitObject.startTime - this.hitObject.timePreempt) ||
        (this.editor.clock.currentTimeAnimated > this.hitObject.endTime + 700)
    ) {
      this.alpha = 0;
      return;
    }
    const snakeInDuration = Math.min(
        this.hitObject.timeFadeIn * 0.5,
        this.hitObject.spanDuration,
        200,
    );


    let snakeInDistance = animate(
        this.clock.currentTimeAnimated - this.hitObject.startTime,
        -this.hitObject.timePreempt,
        -this.hitObject.timePreempt + snakeInDuration,
        0,
        this.hitObject.path.expectedDistance,
    );

    if (!this.snakingSlidersEnabled) {
      snakeInDistance = this.hitObject.path.expectedDistance;
    }

    if (this.snakeInProgress != snakeInDistance || this.pathVersion !== this.hitObject.path.version) {
      const path = this.hitObject.path.getRange(0, snakeInDistance);

      this.geometry.update(
          path,
          this.radius,
      );
    }

    this.snakeInProgress = snakeInDistance;
    this.pathVersion = this.hitObject.path.version;
  }

  snakeInProgress = 0;

  get alpha() {
    // return this.filter.alpha;
    return 1;
  }

  set alpha(value: number) {
    this.filter.alpha = value;
  }

}