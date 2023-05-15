import { HitObject, Vec2 } from "@osucad/common";
import { Command } from "./command";
import { Prop } from "./decorators";
import { clampHitObjectMovement } from "@/utils/bounds";
import { ref } from "vue";

export type Axis = "x" | "y";

export class MoveHitObjectCommand extends Command {
  id = "hitobject.move";
  name = "Move Selection";

  interactive = true;

  state!: {
    hitObjects: HitObject[];
    positions: Vec2[];
  };

  @Prop({
    type: "Vec2",
  })
  movement = ref(Vec2.zero());

  setup() {
    if (this.selection.value.size === 0) return false;

    const hitObjects = this.selection.selectedHitObjects;
    this.state = {
      hitObjects: hitObjects,
      positions: hitObjects.map((h) => h.position),
    };
  }

  apply(): void {
    const movement = clampHitObjectMovement(
      this.movement.value,
      this.state.hitObjects,
      this.state.positions
    );

    this.state.hitObjects.forEach((hitObject, index) => {
      const startPosition = this.state.positions[index];
      hitObject.position = Vec2.round(Vec2.add(startPosition, movement));
    });
  }

  abort(): void {
    this.state.hitObjects.forEach((hitObject, index) => {
      hitObject.position = this.state.positions[index];
    });
  }
}
