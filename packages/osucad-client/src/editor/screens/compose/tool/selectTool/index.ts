import { defineAsyncComponent } from "vue";
import { ComposeScreenTool } from "..";
import icon from "@/assets/icons/select.svg";

export const SelectTool: ComposeScreenTool = {
  name: "Select",
  icon,
  component: defineAsyncComponent(() => import("./SelectTool.vue")),
};
