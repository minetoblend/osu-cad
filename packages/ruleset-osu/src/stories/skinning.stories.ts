import type { Meta, StoryObj } from "@osucad/storybook-renderer";
import type { SkinArgs } from "./SkinningStory";
import { SkinningStory } from "./SkinningStory";


const meta: Meta<SkinArgs> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/configure/#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Skinning",
  component: SkinningStory,
  args: {
    comboColor1: "#FFCED1",
    comboColor2: "#20B2AA",
    comboColor3: "#00BFFF",
  },
  argTypes: {
    comboColor1: {
      control: {
        type: "color",
      },
    },
    comboColor2: {
      control: {
        type: "color",
      },
    },
    comboColor3: {
      control: {
        type: "color",
      },
    },
  },
};

export default meta;
type Story = StoryObj<SkinningStory>;

export const Demo: Story = {};
