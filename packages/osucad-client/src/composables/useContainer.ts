import {IUnisonContainer} from "@osucad/unison-client";
import {createInjectionState} from "@vueuse/core";

export const [provideContainer, useContainer] = createInjectionState(
  (container: IUnisonContainer) => container
);
