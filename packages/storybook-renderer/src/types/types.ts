import type { StoryContext as DefaultStoryContext } from "@storybook/csf";
import type { Drawable } from "@osucad/framework";
import type { WebRenderer } from "@storybook/types";

export type { RenderContext, WebRenderer } from "@storybook/types";

export type ApplicationResizeFunctionReturnType = {
  rendererWidth: number;
  rendererHeight: number;
  canvasWidth: number;
  canvasHeight: number;
};

export interface StoryFnOsucadFrameworkObject
{
  create: () => Drawable
  update: (args: any) => void
}

export interface StoryDrawable<TArgs = any> extends Drawable
{
  updateArgs(args: TArgs): void;
}

export type StoryFnOsucadFrameworkReturnType = Drawable | (new () => Drawable);

export interface IStorybookStory
{
  name: string;
  render: (context: any) => any;
}

export interface IStorybookSection
{
  kind: string;
  stories: IStorybookStory[];
}

export interface ShowErrorArgs
{
  title: string;
  description: string;
}

export interface OsucadRenderer extends WebRenderer
{
  component: new () => Drawable;
  storyResult: StoryFnOsucadFrameworkReturnType;
}

export type StoryContext = DefaultStoryContext<OsucadRenderer> & {
  parameters: DefaultStoryContext<OsucadRenderer>["parameters"];
};
