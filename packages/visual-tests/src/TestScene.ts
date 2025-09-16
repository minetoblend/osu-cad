import type { DependencyContainer } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";

export interface TestMethod
{
  name: string
  invoke: () => void
}

export class TestScene extends Container
{
  public readonly testMethods: TestMethod[] = [];
  public readonly setupMethods: TestMethod[] = [];

  public constructor()
  {
    super({ relativeSizeAxes: Axes.Both });
  }

  public override get dependencies(): DependencyContainer
  {
    return super.dependencies as DependencyContainer;
  }
}

export function setupSteps()
{
  return (
    target: () => void,
    context: ClassMethodDecoratorContext<TestScene, () => void>,
  ) =>
  {
    let name = context.name;

    if (typeof name !== "string")
      throw new Error("Test methods must have string name");

    if (context.private)
      name = name.slice(1);

    context.addInitializer(function()
    {
      this.setupMethods.push({
        name,
        invoke: () => target.call(this),
      });
    });
  };
}

export function test()
{
  return (
    target: () => void,
    context: ClassMethodDecoratorContext<TestScene, () => void>,
  ) =>
  {
    let name = context.name;

    if (typeof name !== "string")
      throw new Error("Test methods must have string name");

    if (context.private)
      name = name.slice(1);

    context.addInitializer(function()
    {
      this.testMethods.push({
        name,
        invoke: () => target.call(this),
      });
    });
  };
}
