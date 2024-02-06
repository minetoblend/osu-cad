<script setup lang="ts">
import Card from "../components/card/Card.vue";
import TabList from "../components/tabList/TabList.vue";
import FormField from "@/components/FormField.vue";
import Switch from "@/components/Switch.vue";
import {usePreferences} from "@/composables/usePreferences.ts";

const activeTab = ref("visual");

const {preferences, loaded} = usePreferences()

</script>

<template>
  <div style="max-width: 700px; margin: 2rem auto" v-if="loaded">
    <Card>
      <PreferencesForm/>
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

h5 {
  margin: 1rem 0;
}
</style>