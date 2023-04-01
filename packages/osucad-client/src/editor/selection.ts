import {nn} from "@osucad/unison";
import {shallowReactive} from "vue";
import {IUnisonContainer} from "@osucad/unison-client";
import {HitObject} from "@osucad/common";
import {useClientState} from "@/composables/clientState";

export class HitObjectSelectionManager {
  #selection = shallowReactive(new Set<string>());

  #others = shallowReactive(new Map<string, Set<HitObject>>());

  constructor(private container: IUnisonContainer) {
    const { others, me } = useClientState(
      container.connection,
      container.users,
      "selection"
    );

    container.signals.on("selection", (data: any, message) => {
      if (message.clientId === container.connection.id) return;

      this.#others.set(message.clientId, new Set(data));
    });
  }

  select(...hitObjects: HitObject[]) {
    this.#selection.clear();
    this.add(...hitObjects);
  }

  add(...hitObjects: HitObject[]) {
    hitObjects.forEach((hitObject) => {
      this.#selection.add(nn(hitObject.id));
    });
    this.#emitSelectionUpdate();
  }

  clear() {
    this.#selection.clear();
    this.#emitSelectionUpdate();
  }

  isSelected(hitObject: HitObject): boolean {
    return this.#selection.has(nn(hitObject.id));
  }

  #emitSelectionUpdate() {
    this.container.signals.emit("selection", [...this.#selection]);
  }

  get selectedHitObjects() {
    return [...this.#selection].map((id) =>
      this.container.document.objects.hitObjects.getChild(id)
    ) as HitObject[];
  }

  get value() {
    return this.#selection;
  }
}
