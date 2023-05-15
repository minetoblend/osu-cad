import { Container, Graphics, ObservablePoint, Sprite } from "pixi.js";
import { createRenderer, camelize, toHandlerKey } from "vue";


export const { render: renderPixi, createApp: createPixiApp } = createRenderer<
  Container,
  Container
>({
  createElement: (type) => {
    switch (type) {
      case "pixi-sprite":
        return new Sprite();
      case "pixi-container":
        return new Container();
      case "pixi-graphics":
        return new Graphics();
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  },
  patchProp: (el, key, prevValue, nextValue) => {
    if (key.startsWith("on")) {
      el.eventMode = "static";

      const eventName = key.slice(2).toLowerCase();
      if (prevValue) el.off(eventName as any, prevValue);
      el.on(eventName as any, nextValue);
      return;
    }

    key = camelize(key);

    switch (key) {
      case "position":
        el.position.copyFrom(nextValue);
        break;
      case "scale":
        if (typeof nextValue === "number") el.scale.set(nextValue);
        else el.scale.copyFrom(nextValue);
        break;
      case "center":
        if ("anchor" in el) (el.anchor as ObservablePoint).set(0.5);
      default:
        Reflect.set(el, key, nextValue);
    }
  },
  insert: (child, parent, anchor) => {
    if (anchor) {
      parent.addChildAt(child, parent.getChildIndex(anchor));
    } else {
      parent.addChild(child);
    }
  },
  remove: (child) => {
    child.destroy();
  },
  createText: (text) => {
    return new Container();
  },
  createComment: () => {
    return new Container();
  },
  nextSibling: (node) => {
    const index = node.parent.getChildIndex(node);
    if (node.parent.children.length <= index + 1) return null;
    return (node.parent.getChildAt(index + 1) as Container) ?? null;
  },
  parentNode: (node) => {
    return node.parent;
  },
  setElementText: () => {},
  setText: () => {},
});
