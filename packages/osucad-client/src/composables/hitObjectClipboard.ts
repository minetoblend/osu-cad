import {createGlobalState} from "@vueuse/core";
import {ref, shallowRef} from "vue";
import {HitObject} from "@osucad/common";
import {IUnisonContainer} from "@osucad/unison-client";
import {IMapSnapshotData, IObjectSnapshot, ISerializableValue} from "@osucad/unison";


export const useHitObjectClipboard = createGlobalState(() => {
  const clipboard = shallowRef<ISerializableValue[]>([]);

  function write(hitObjects: HitObject[]) {
    hitObjects = [...hitObjects];
    hitObjects.sort((a, b) => a.startTime - b.startTime);
    clipboard.value = hitObjects.map(hitObject => hitObject.serializer.encode(hitObject));
  }

  function read(container: IUnisonContainer) {
    return clipboard.value.map(snapshot => container.runtime.serializer.decode(snapshot)) as HitObject[];
  }

  return {
    clipboard,
    write,
    read,
  };
});