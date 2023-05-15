import { watchThrottled } from "@vueuse/core";
import { IClient, nn } from "@osucad/unison";
import { shallowReactive, watch } from "vue";
import { IUnisonContainer } from "@osucad/unison-client";
import { HitObject } from "@osucad/common";
import { useClientState } from "@/composables/clientState";

export class HitObjectSelectionManager {
  #selection = shallowReactive(new Set<string>());

  #others = shallowReactive(new Map<number, Set<string>>());

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

    watchThrottled(this.#selection, (selection) => {
      this.container.signals.emit("selection", [...this.#selection]);
    });

    container.document.objects.hitObjects.on(
      "remove",
      (hitObject: HitObject, id: string) => {
        this.#selection.delete(id);
      }
    );
  }

  select(...hitObjects: HitObject[]) {
    this.#selection.clear();
    this.add(...hitObjects);
  }

  add(...hitObjects: HitObject[]) {
    hitObjects.forEach((hitObject) => {
      this.#selection.add(nn(hitObject.id));
    });
  }

  remove(...hitObjects: HitObject[]) {
    hitObjects.forEach((hitObject) => {
      this.#selection.delete(nn(hitObject.id));
    });
  }

  clear() {
    this.#selection.clear();
  }

  isSelected(hitObject: HitObject): boolean {
    if (hitObject.isGhost) return true;
    if (!hitObject.id) return false;
    return this.#selection.has(nn(hitObject.id));
  }

  get selectedHitObjects() {
    return this.container.document.objects.hitObjects.items.filter(
      (it: HitObject) => this.#selection.has(it.id!)
    ) as HitObject[];
  }

  get value() {
    return this.#selection;
  }

  getSelectedBy(hitObject: HitObject): IClient[] {
    return [...this.#others.entries()]
      .filter(([userId, set]) => {
        return set.has(hitObject.id!);
      })
      .map(([userId]) => this.container.users.getUser(userId)!);
  }
}
