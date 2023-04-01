import {Container, DisplayObject} from "pixi.js";
import {getToolContext} from "../defineTool";
import {onScopeDispose} from "vue";

export function useViewportOverlay(...children: DisplayObject[]) {
  const ctx = getToolContext();
  const container = new Container();
  container.addChild(...children);

  const overlayContainer = ctx.overlay;
  overlayContainer.addChild(container);

  onScopeDispose(() => {
    overlayContainer.removeChild(container);
    container.destroy();
  });

  return container;
}
