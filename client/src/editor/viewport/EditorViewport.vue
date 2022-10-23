<template>
  <shortcut-receiver class="editor-screen" @shortcut="toolManager.handleShortcut($event)">
    <n-layout has-sider class="editor-screen">
      <n-layout-sider
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :collapsed="collapsed"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false">

        <n-menu
            v-model:value="toolManager.toolId"
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions">

        </n-menu>
      </n-layout-sider>

      <div ref="viewportContainer"
           class="viewport-container"
           @mousedown="handleMouseDown"
           @contextmenu.prevent
      >
        <div class="canvas-container" ref="canvasContainer">

        </div>
        <n-dropdown
            :show="!!toolManager.contextMenuOptions.value"
            :options="toolManager.contextMenuOptions.value"
            :x="toolManager.contextMenuPos.x"
            :y="toolManager.contextMenuPos.y"
            trigger="manual"
            :on-clickoutside="() => toolManager.hideContextMenu()"
            @select="toolManager.onContextMenuSelect($event)">
        </n-dropdown>
      </div>


    </n-layout>
  </shortcut-receiver>
</template>

<script setup lang="ts">
import {onMounted, ref, shallowRef, watch} from "vue";
import {Container, Renderer, Ticker} from "pixi.js";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {useContext} from "@/editor";
import {Vec2} from "@/util/math";
import {CursorContainer} from "@/editor/viewport/cursorContainer";
import {ViewportMenuOptions} from "@/editor/viewport/menuOptions";
import {ToolManager} from "@/editor/viewport/tools/manager";
import ShortcutReceiver from "@/components/ShortcutReceiver.vue";

const ctx = useContext()

const viewportContainer = ref<HTMLDivElement>()
const canvasContainer = ref<HTMLDivElement>()
const cursorInside = ref(false)
const cursorPos = shallowRef<Vec2>()

const renderer = new Renderer({
  width: 640,
  height: 480,
  antialias: true,
  powerPreference: "high-performance",
  clearBeforeRender: true,
})


const menuOptions = ViewportMenuOptions


const playfieldWidth = 512
const playfieldHeight = 384
const stage = new Container()
let scale = ref(1.0)

const collapsed = ref(true)

const cursorContainer = new CursorContainer(ctx)

const resizeObserver = new ResizeObserver(([entry]) => {
  renderer.resize(entry.contentRect.width, entry.contentRect.height)

  const padding = 25

  scale.value = Math.min(
      entry.contentRect.width / (playfieldWidth + padding * 2),
      entry.contentRect.height / (playfieldHeight + padding * 2)
  )

  stage.scale.set(scale.value)

  stage.position.set(
      (entry.contentRect.width - scale.value * playfieldWidth) / 2,
      (entry.contentRect.height - scale.value * playfieldHeight) / 2,
  )

  render()
})

function render() {
  playfield.update()
  renderer.render(stage)
}

const playfield = new PlayfieldDrawable(ctx, renderer, scale)
const toolManager = new ToolManager(ctx, playfield)

function init() {
  stage.addChild(playfield)
  stage.addChild(toolManager.toolOverlay)
  stage.addChild(cursorContainer)

  Ticker.shared.add(() => render())
}

onMounted(() => {
  canvasContainer.value!.appendChild(renderer.view)
  init()
  resizeObserver.observe(viewportContainer.value!)
  document.addEventListener('mousemove', handleMouseMove)
})

let inFocus = true
window.addEventListener('focus', () => inFocus = true)
window.addEventListener('blur', () => {
  inFocus = false
})


function handleMouseMove(evt: MouseEvent) {
  if (!viewportContainer.value || !inFocus) {
    cursorInside.value = false
    return;
  }
  const rect = viewportContainer.value!.getBoundingClientRect()
  cursorPos.value = new Vec2(
      evt.clientX - rect.x - stage.position.x,
      evt.clientY - rect.y - stage.position.y
  ).divF(scale.value)
  cursorInside.value = evt.clientX > rect.left && evt.clientY > rect.top && evt.clientX < rect.right && evt.clientY < rect.bottom
}

let cursorChanged = true
watch(() => [cursorInside.value, cursorPos.value], () => {
  cursorChanged = true
  if (cursorInside.value) {
    cursorContainer.setOwnPos(cursorPos.value!)
    toolManager.handleMouseMove(cursorPos.value!)
  } else {
    cursorContainer.setOwnPos(null)
  }
})

setInterval(() => {
  if (cursorChanged) {
    cursorChanged = false
    if (cursorInside && cursorPos.value!) {
      ctx.sendMessage('cursorPos', cursorPos.value!)
      // ctx.sendMessageLegacy(ClientOpCode.CursorPos, {pos: cursorPos.value!})
    } else {
      // ctx.sendMessageLegacy(ClientOpCode.CursorPos, {pos: null})
    }
  }
}, 50)

function handleMouseDown(evt: MouseEvent) {
  if (!viewportContainer.value || !inFocus) {
    cursorInside.value = false
    return;
  }

  const rect = viewportContainer.value!.getBoundingClientRect()
  toolManager.handleMouseDown(evt,
      new Vec2(rect.x + stage.position.x, rect.y + stage.position.y),
      scale.value
  )


}

</script>

<style lang="scss">

.n-layout-scroll-container {
  overflow: hidden !important;
}

.viewport-container {
  height: 100%;
  width: 100%;
  position: relative;

  canvas {
    position: absolute;
  }

  cursor: none;
}

</style>