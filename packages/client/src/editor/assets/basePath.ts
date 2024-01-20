import {AssetsBundle} from "pixi.js";

function join(...parts: string[]) {
  return parts.join("/").replace(/\/+/g, "/");
}

export function withBasePath(basePath: string, bundle: AssetsBundle): AssetsBundle {
  return {
    name: bundle.name,
    assets: bundle.assets.map(asset => {
      let src = asset.src;
      if (Array.isArray(src)) {
        src = src.map(src => {
          if (typeof src !== "string") return src;
          return join(basePath, src);
        });
      } else if (typeof src === "string") {
        src = join(basePath, src);
      }

      return { ...asset, src };
    }),
  };
}