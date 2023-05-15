import { Slider } from "@osucad/common";
import { GeometryBuilder, createSliderGeometry } from "./sliderGeometry";
import { Ref, ref } from "vue";

export class SliderGeometrySource {
  constructor(readonly slider: Slider) {}

  private geo: GeometryBuilder | undefined;

  readonly snakeInProgress = ref(1);
  readonly snakeOutProgress = ref(0);

  get radius() {
    return this.slider.radius * 0.94;
  }

  invalidate() {
    this.geo = undefined;
  }

  getGeometry() {
    if (!this.geo) {
      this.geo = createSliderGeometry(
        this.slider.sliderPath.getRange(
          this.slider.expectedDistance * this.snakeOutProgress.value,
          this.slider.expectedDistance * this.snakeInProgress.value
        ),
        this.radius / 0.75
      );
    }

    return this.geo;
  }

  getBounds() {
    return this.slider.sliderPath.getBounds();
  }
}
