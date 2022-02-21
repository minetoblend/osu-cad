import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {PIXI} from "@/pixi";
import {DrawableHitObject} from "@/draw/HitObject";
import {onMounted, Ref} from "vue";
import {injectResources} from "@/util/inject";
import {HitObjectDrawManager} from "@/objects/HitObjectDrawManager";
import {EditorContext} from "@/objects/Editor";
import {Subject} from "rxjs";
import {Vec2} from "@/util/math";
import {HitObject} from "@/objects/HitObject";

export interface OsuCadMouseEvent {
  position: Vec2,
  button: number
  hitObject?: HitObject
}

export class Playfield extends OsuCadContainer {
  private readonly grid: PIXI.Graphics;
  private readonly hitObjectContainer: PIXI.Container
  private readonly overlayContainer: PIXI.Container

  readonly onMouseMove = new Subject<OsuCadMouseEvent>()
  readonly onMouseDown = new Subject<OsuCadMouseEvent>()

  readonly onHitObjectMouseDown = new Subject<OsuCadMouseEvent>()

  constructor(resourceProvider: ResourceProvider, readonly context: EditorContext) {
    super(resourceProvider);

    this.interactive = true
    this.hitArea = new PIXI.Rectangle(-1000, -1000, 3000, 3000)


    const g = new PIXI.Graphics()

    g.lineStyle(2, 0xFFFFFF, 0.5)
    g.drawRoundedRect(0, 0, 512, 384, 5)

    this.addChild(g)

    this.grid = new PIXI.Graphics()
    this.grid.alpha = 0.3

    this.initGrid()
    this.addChild(this.grid)

    this.hitObjectContainer = new PIXI.Container()
    this.addChild(this.hitObjectContainer)

    this.overlayContainer = new PIXI.Container()
    this.addChild(this.overlayContainer)

    this.on('mousemove', (evt: PIXI.InteractionEvent) => {
      const pos = evt.data.getLocalPosition(this)
      this.onMouseMove.next({
        position: new Vec2(pos.x, pos.y),
        button: evt.data.button
      })
    })

    this.on('mousedown', evt => this.mouseDownHandler(evt))

    this.on('rightdown', (evt: PIXI.InteractionEvent) => {
      const pos = evt.data.getLocalPosition(this)

      this.onMouseDown.next({
        position: new Vec2(pos.x, pos.y),
        button: evt.data.button
      })
    })


  }

  private mouseDownHandler(evt: PIXI.InteractionEvent) {
    const pos = evt.data.getLocalPosition(this)

    this.onMouseDown.next({
      position: new Vec2(pos.x, pos.y),
      button: evt.data.button,
      hitObject: this.context.getHitObjectAt(this.context.currentTime.value, new Vec2(pos.x, pos.y))
    })
  }

  initGrid(gridSize: number = 32) {
    this.grid.clear()
    this.grid.lineStyle(1, 0xFFFFFF, 0.6)

    for (let y = gridSize; y < 384; y += gridSize) {
      if (Math.abs(y - 384 / 2) < 2)
        continue
      this.grid.moveTo(0, y)
      this.grid.lineTo(512, y)
    }
    for (let x = gridSize; x < 512; x += gridSize) {
      if (Math.abs(x - 512 / 2) < 2)
        continue
      this.grid.moveTo(x, 0)
      this.grid.lineTo(x, 384)
    }
    this.grid.lineStyle(2, 0xFFFFFF)
    this.grid.moveTo(512 / 2, 0)
    this.grid.lineTo(512 / 2, 384)
    this.grid.moveTo(0, 384 / 2)
    this.grid.lineTo(512, 384 / 2)
  }


  addHitObjectDrawable(drawable: DrawableHitObject) {
    /*let index = (this.hitObjectContainer.children as DrawableHitObject[]) .findIndex( (it: DrawableHitObject) =>
       it.hitObject.time < drawable.hitObject.time
    )

    if(index === -1)
        index = 1*/
    drawable.zIndex = -drawable.hitObject.time

    this.hitObjectContainer.addChild(drawable)
    this.hitObjectContainer.sortChildren()
  }

  removeHitObjectDrawable(drawable: DrawableHitObject) {
    this.hitObjectContainer.removeChild(drawable)
  }

  set overlay(overlay: OsuCadContainer | null) {
    this.overlayContainer.removeChildren()
    if (overlay)
      this.overlayContainer.addChild(overlay)
  }
}

export function setupPlayfield(
  context: EditorContext,
  playfieldContainer: Ref<HTMLDivElement | undefined>,
  app: PIXI.Application,
) {

  const playFieldWrapper = new PIXI.Container()

  const playField = new Playfield(injectResources(), context)

   new HitObjectDrawManager(context, playField)

  function resizeApp(width: number, height: number) {
    app.renderer.resize(width, height)

    const paddingX = 50
    const paddingY = 50

    const scaleX = width / (512 + paddingX * 2)
    const scaleY = height / (384 + paddingY * 2)
    const scaleFactor = Math.min(
      scaleX,
      scaleY,
    )

    playFieldWrapper.scale.set(scaleFactor)

    const x = (width - (512 + paddingX * 2) * scaleFactor) / 2
    const y = (height - (384 + paddingY * 2) * scaleFactor) / 2

    playFieldWrapper.position.set(x, y)
    playField.position.set(paddingX, paddingY)
  }

  onMounted(() => {
    playfieldContainer.value!.appendChild(app.view)
    app.stage.addChild(playFieldWrapper)
    playFieldWrapper.addChild(playField)

    resizeApp(playfieldContainer.value!.scrollWidth, playfieldContainer.value!.scrollHeight)
    window.addEventListener('resize', () => resizeApp(playfieldContainer.value!.clientWidth, playfieldContainer.value!.clientHeight))
  })

  return playField
}