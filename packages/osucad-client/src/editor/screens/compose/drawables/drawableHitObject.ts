import { EditorInstance } from "@/editor/createEditor";
import { HitObject, Vec2 } from "@osucad/common";
import { IClient } from "@osucad/unison";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { Container, IDestroyOptions } from "pixi.js";
import { EffectScope, computed, nextTick, onScopeDispose, watch } from "vue";

export abstract class DrawableHitObject<
  T extends HitObject = HitObject
> extends Container {
  effectScope = new EffectScope(true);

  constructor(
    public readonly hitObject: T,
    protected readonly editor: EditorInstance
  ) {
    super();
    this.position.copyFrom(hitObject.stackedPosition);

    this.effectScope.run(() => {
      this.bind?.(hitObject);

      watch(
        () => hitObject.position,
        (position) => {
          if (editor.selection.isSelected(hitObject))
            this.position.copyFrom(position);
        }
      );

      const onChange = (key: keyof T, value: any) =>
        this.onHitObjectChange(key, value);
      hitObject.on("change", onChange);
      onScopeDispose(() => {
        hitObject.off("change", onChange);
      });

      watch(
        () => hitObject.stackedPosition,
        (position) => this.position.copyFrom(position)
      );

      watch(
        () =>
          [
            editor.selection.isSelected(hitObject),
            editor.selection.getSelectedBy(hitObject),
          ] as const,
        ([selected, selectedBy]) => this.onSelected?.(selected, selectedBy)
      );

      nextTick(() => {
        this.onSelected?.(
          editor.selection.isSelected(hitObject),
          editor.selection.getSelectedBy(hitObject)
        );
      });
    });
  }

  bind?(hitObject: T): void;

  abstract update(): void;

  onHitObjectChange<K extends keyof T>(key: K, value: T[K]): void {}

  onSelected?(selected: boolean, selectedBy: IClient[]): void;

  destroy(options?: boolean | IDestroyOptions | undefined): void {
    super.destroy(options);
    this.effectScope.stop();
  }
}
