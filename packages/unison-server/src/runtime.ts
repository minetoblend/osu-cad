import {
  ITypeFactory,
  IUnisonRuntime,
  UnisonBaseRuntime,
} from "@osucad/unison";

export class UnisonServerRuntime
  extends UnisonBaseRuntime
  implements IUnisonRuntime
{
  constructor(types?: ITypeFactory[]) {
    super();

    if (types) {
      for (const factory of types) {
        this.typeMap.set(factory.type, factory);
      }
    }
  }
}
