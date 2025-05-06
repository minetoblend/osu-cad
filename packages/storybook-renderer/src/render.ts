import { Drawable, WebGameHost } from "@osucad/framework";
import { StorybookGame } from "./StorybookGame";
import type { ArgsStoryFn, RenderContext, RenderToCanvas } from "@storybook/types";
import type { OsucadRenderer, StoryDrawable } from "./types/types";

let game: StorybookGame | undefined;

const host = new WebGameHost("storybook");
const container = document.createElement("div");
container.style.width = "100vw";
container.style.height = "100vh";
container.style.overflow = "hidden";

function getGame()
{
  if (!game)
  {
    game = new StorybookGame();

    host.run(game, container);
  }

  return game;
}

export const render: ArgsStoryFn<OsucadRenderer> = (args, context) =>
{
  const { id, component: Component } = context;
  if (!Component)
  {
    throw new Error(
        `Unable to render story ${id} as the component annotation is missing from the default export`,
    );
  }

  return Component;
};

export const renderToDOM: RenderToCanvas<OsucadRenderer> = (
  { storyContext, unboundStoryFn, kind, id, name, showMain, showError, forceRemount }: RenderContext<OsucadRenderer>,
  domElement: OsucadRenderer["canvasElement"],
) =>
{
  if (!domElement.hasChildNodes())
    domElement.appendChild(container);

  const game = getGame();

  const storyObject = unboundStoryFn(storyContext);

  if (storyObject instanceof Drawable)
  {
    game.storyContainer.child = storyObject;
  }
  else
  {
    let instance: Drawable | undefined;

    if (game.storyContainer.children.length === 1)
    {
      instance = game.storyContainer.child;
      if (!(instance instanceof storyObject))
      {
        instance = undefined;
      }
    }

    if (!instance || forceRemount)
    {
      instance = new storyObject();
      game.storyContainer.child = instance;
    }

    if (canUpdate(instance))
    {
      instance.updateArgs(storyContext.args);
    }
  }
  showMain();
};

function canUpdate(obj: Drawable): obj is StoryDrawable
{
  return "updateArgs" in obj && typeof obj.updateArgs === "function";
}

export const renderToCanvas: RenderToCanvas<OsucadRenderer> = renderToDOM;
