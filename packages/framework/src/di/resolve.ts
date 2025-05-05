import { getCurrentDrawablScope } from "../bindables/lifetimeScope";
import { LoadState } from "../graphics/drawables/Drawable";
import { debugAssert } from "../utils/debugAssert";

export function resolve<T>(type: new (...args: any[]) => T): T
{
  const scope = getCurrentDrawablScope();
  if (!scope)
  {
    throw new Error("No scope found");
  }

  debugAssert(scope.loadState >= LoadState.Loading, "Cannot resolve before load");

  return scope.dependencies.resolve(type);
}
