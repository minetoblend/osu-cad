import { Matrix } from "pixi.js";
import { HitObject, Vec2 } from "@osucad/common";
import { Command } from "./command";
import { Prop } from "./decorators";
import { clampHitObjectMovement } from "@/utils/bounds";
import { ref } from "vue";

export type Axis = "x" | "y";

export class ScaleHitObjectsCommand extends Command {
  id = "hitobject.scale";
  name = "Scale Selection";

  interactive = true;

  state!: {
    hitObjects: HitObject[];
    positions: Vec2[];
  };

  @Prop({ type: "Vec2" })
  scale = ref(Vec2.zero());

  @Prop({ type: "Vec2" })
  center = ref(Vec2.zero());

  setup() {
    if (this.selection.value.size === 0) return false;

    const hitObjects = this.selection.selectedHitObjects;
    const positions = hitObjects.map((h) => h.position);
    this.state = {
      hitObjects,
      positions,
    };
    this.center = ref(Vec2.average(...positions));
  }

  apply(): void {
    const matrix = new Matrix();

    matrix.translate(-this.center.value.x, -this.center.value.y);
    matrix.scale(this.scale.value.x, this.scale.value.y);
    matrix.translate(this.center.value.x, this.center.value.y);

    this.state.hitObjects.forEach((hitObject, index) => {
      const newPos = matrix.apply(this.state.positions[index], Vec2.zero());
      hitObject.position = Vec2.round(newPos);
    });
  }

  abort(): void {
    this.state.hitObjects.forEach((hitObject, index) => {
      hitObject.position = this.state.positions[index];
    });
  }
}
