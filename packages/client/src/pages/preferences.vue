<script setup lang="ts">
import Card from "../components/card/Card.vue";
import TabList from "../components/tabList/TabList.vue";
import Checkbox from "primevue/checkbox";
import ColorPicker from "primevue/colorpicker";
import InputSwitch from "primevue/inputswitch";
import Slider from "primevue/slider";
import ToggleButton from "primevue/togglebutton";
import InputNumber from "primevue/inputnumber";
import FormField from "@/components/FormField.vue";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import SelectButton from "primevue/selectbutton";

const activeTab = ref("visual");

const preferences = reactive({
  showGrid: true,
  gridColor: "#ffffff",
  gridAlpha: 0.5,
  snakingSliders: true,
  hitAnimations: true,
  emulateAspectRatio: false,
});

</script>

<template>
  <div style="max-width: 700px; margin: 0 auto">
    <h1>Preferences</h1>
    <Card>
      <div class="grid">
        <div class="col-3">
          <div class="p-2">
            <TabList v-model="activeTab" :items="[
            { label: 'General', value:'general' },
            { label: 'Visual', value:'visual' },
            { label: 'Shortcuts', value:'shortcuts' }
          ]"/>
          </div>
        </div>
        <div v-if="activeTab === 'visual'" class="col-9">
          <div class="settings-pane">
            <h4>Playfield</h4>
            <FormField label="Snaking Sliders">
              <InputSwitch v-model="preferences.snakingSliders"/>
            </FormField>
            <FormField label="Hit Animations">
              <InputSwitch v-model="preferences.hitAnimations"/>
            </FormField>
            <FormField label="Aspect Ratio" full-width>
              <div class="my-2">
                <SelectButton v-model="preferences.emulateAspectRatio" :options="[false, true]">
                  <template #option="{option}">
                    {{ option ? "4:3" : "Widescreen" }}
                  </template>
                </SelectButton>
              </div>
            </FormField>
            <hr>
            <h3>Grid</h3>
            <FormField label="Visible">
              <InputSwitch v-model="preferences.showGrid"/>
            </FormField>
            <FormField label="Color">
              <ColorPicker v-model="preferences.gridColor"/>
            </FormField>
            <FormField label="Opacity">
              <InputNumber v-model="preferences.gridAlpha" input-class="w-full" :min="0" :max="1"/>
              <Slider v-model="preferences.gridAlpha" :min="0" :max="1" :step="0.01"></Slider>
            </FormField>
          </div>
        </div>
      </div>
    </Card>
  </div>

</template>

<style lang="scss">
hr {
  opacity: 0.25;
}

.settings-pane {
  background-color: darken($surface-50, 2%);
  margin: -0.5rem;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

}
</style>