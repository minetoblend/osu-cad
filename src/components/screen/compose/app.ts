import {onBeforeUnmount} from "vue";
import {PIXI} from "@/pixi";

export function createApp() {

  const app = new PIXI.Application({
    width: 800,
    height: 600,
    antialias: true
  })

  onBeforeUnmount(() =>
    app.destroy()
  )

  return app
}