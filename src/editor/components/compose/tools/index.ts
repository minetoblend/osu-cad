import {MaybeComputedRef, useMouse, useMouseInElement} from "@vueuse/core";
import {Container, DisplayObject} from "pixi.js";
import {computed, markRaw, reactive, Ref, ref, watch, watchEffect} from "vue";
import {EditorContext, useEditor} from "@/editor";
import {Vec2} from "@/util/vec2";
import {selectTool} from "@/editor/components/compose/tools/select";

export type Tool = ReturnType<typeof defineTool<any>>

export function defineTool<Setup extends SetupBase>(opts: ToolOptions<Setup>) {
    return {
        create: (ctx: SetupContext) => {

            const tool = opts.setup(ctx)
            if (tool.overlay)
                tool.overlay = markRaw(tool.overlay)

            return reactive(tool)
        },
        name: opts.name,
        icon: opts.icon,
    }
}

export function useTools(viewportContainer: Ref<HTMLElement | undefined>) {
    const tools = new Map<string, Tool>([
        ['select', selectTool],
    ])

    const container = new Container()

    const toolId = ref('select')


    let currentTool: Tool
    let currentInstance: any

    const editor = useEditor()

    const {elementX, elementY} = useMouseInElement(viewportContainer)

    const mousePosition = computed(() => {
        return new Vec2(elementX.value, elementY.value)
    })


    watch(toolId, (tool, oldTool) => {
        if (tool !== oldTool) {
            currentTool = tools.get(toolId.value)!

            currentInstance = currentTool.create({
                ...editor,
                mousePosition
            })
        }
    })

    toolId.value = 'select'

    return {
        tools,
        currentTool: toolId,
        container,
    }
}

export type SetupBase = {
    overlay?: DisplayObject
}

export type SetupContext = EditorContext & {
    mousePosition: MaybeComputedRef<Vec2>
}


type ToolOptions<Setup extends SetupBase> = {
    name: MaybeComputedRef<string>
    icon: any,
    setup: (ctx: SetupContext) => Setup
}


