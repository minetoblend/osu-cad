import {defineTool} from "@/editor/components/compose/tools/index";
import {container} from "@/editor/components/compose/drawable/dsl";
import {isSlider} from "@/editor/state/hitobject/slider";
import {Container} from "pixi.js";

export const selectTool = defineTool({
    name: 'Select',
    icon: null,
    setup: ctx => {
        const overlay = new Container()



        return {
            overlay
        }
    }
})
