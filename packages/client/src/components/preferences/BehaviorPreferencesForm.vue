<script setup lang="ts">
import {BehaviorPreferences} from "@osucad/common";

defineProps<{
  preferences: BehaviorPreferences
}>()
</script>

<template>
  <h3>Behavior</h3>
  <FormField full-width label="Right click behavior">
    <ButtonGroup>
      <Button :outline="preferences.rightClickBehavior !== 'contextMenu'"
              @click="preferences.rightClickBehavior = 'contextMenu'">
        Context Menu
      </Button>
      <Button :outline="preferences.rightClickBehavior !== 'delete'"
              @click="preferences.rightClickBehavior = 'delete'">
        Delete
      </Button>
    </ButtonGroup>
  </FormField>
</template>