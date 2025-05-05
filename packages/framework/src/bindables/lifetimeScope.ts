import type { Drawable } from "../graphics/drawables/Drawable";

const drawableScopeStack: Drawable[] = [];

export function getCurrentDrawablScope(): Drawable | undefined 
{
  return drawableScopeStack[drawableScopeStack.length - 1];
}

export function pushDrawableScope(drawable: Drawable) 
{
  drawableScopeStack.push(drawable);
}

export function popDrawableScope() 
{
  drawableScopeStack.pop();
}

export function withDrawableScope<T>(drawable: Drawable, callback: () => T): T 
{
  try 
  {
    pushDrawableScope(drawable);
    return callback();
  }
  finally 
  {
    popDrawableScope();
  }
}
