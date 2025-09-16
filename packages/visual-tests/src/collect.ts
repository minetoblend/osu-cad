import { Bindable } from "@osucad/framework";
import type { TestScene } from "./TestScene";

export const tests = new Bindable(import.meta.glob("./**/*.testscene.ts", {
  query: "testscene",
  eager: false,
}));

export interface TestSceneWrapper
{
  default: {
    scene: Bindable<(new () => TestScene) | undefined>
  }
}

export function useTests()
{
  return tests.getBoundCopy() as Bindable<Record<string, () => Promise<TestSceneWrapper>>>;
}

if (import.meta.hot)
{
  import.meta.hot.accept((newModule) =>
  {
    tests.value = (newModule as any).tests.value;
  });
}
