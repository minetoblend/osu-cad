import type { HitObject } from "@osucad/core";
import { ObservableSet } from "@osucad/framework";

export class HitObjectSelection<T extends HitObject> extends ObservableSet<T>
{
}
