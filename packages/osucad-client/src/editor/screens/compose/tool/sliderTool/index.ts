import { defineAsyncComponent } from "vue";
import { ComposeScreenTool } from "..";
import icon from "@/assets/icons/slider.svg";

export const SliderTool: ComposeScreenTool = {
  name: "Slider",
  icon,
  component: defineAsyncComponent(() => import("./SliderTool.vue")),
};
