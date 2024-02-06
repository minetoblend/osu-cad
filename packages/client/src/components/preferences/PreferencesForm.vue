<script setup lang="ts">
import TabList from "@/components/tabList/TabList.vue";
import {usePreferences} from "@/composables/usePreferences.ts";

const {preferences, loaded} = usePreferences()

const activeTab = ref("viewport");

watchEffect(() => {
  console.log(preferences)
})

</script>

<template>
  <div v-if="loaded" class="preferences-form">
    <div class="categories">
      <div class="p-2">
        <TabList v-model="activeTab" :items="[
            { label: 'Behavior', value:'behavior' },
            { label: 'Viewport', value:'viewport' },
            { label: 'Graphics', value:'graphics' },
            { label: 'Audio', value:'audio' },
          ]"/>
      </div>
    </div>
    <div class="settings-pane">
      <BehaviorPreferencesForm v-if="activeTab === 'behavior'" :preferences="preferences.behavior"/>
      <ViewportPreferencesForm v-if="activeTab === 'viewport'" :preferences="preferences.viewport"/>
      <GraphicsPreferencesForm v-if="activeTab === 'graphics'" :preferences="preferences.graphics"/>
      <AudioPreferencesForm v-if="activeTab === 'audio'" :preferences="preferences.audio"/>
    </div>
  </div>
</template>

<style lang="scss">
.preferences-form {
  overflow: hidden;

  h3 {
    font-size: 1.85rem;
    margin: 0;
    padding: 1rem 0;
  }

  h4 {
    font-size: 1.25rem;
    margin: 1rem 0;
  }

  .settings-pane {
    min-height: 100%;
    background-color: rgba(white, 0.05);
  }

  display: flex;
  align-items: stretch;
  gap: 1rem;

  > .categories {
    flex: 0.3;
    box-sizing: content-box;
  }

  > .settings-pane {
    flex: 1;
    padding: 1rem 2rem;
  }
}
</style>