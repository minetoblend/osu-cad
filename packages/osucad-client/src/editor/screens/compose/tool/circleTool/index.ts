import { defineAsyncComponent } from "vue";
import { ComposeScreenTool } from "..";
import icon from "@/assets/icons/circle.svg";

export const CircleTool: ComposeScreenTool = {
  name: "Circle",
  icon,
  component: defineAsyncComponent(() => import("./CircleTool.vue")),
};
