import {Preferences} from "@osucad/common";
import axios from "axios";

export const usePreferences = createGlobalState(() => {
  const preferences = ref<Preferences>()
  const loaded = ref(false)

  async function load() {
    const response = await axios.get<Preferences>('/api/preferences')
    preferences.value = response.data
  }

  load().then(() => {
    loaded.value = true

    watchDebounced(preferences, async (value) => {
      if (!value) return

      await axios.post('/api/preferences', value)
    }, {debounce: 500, deep: true})
  })


  return {
    preferences: reactiveComputed<Preferences>(() => preferences.value ?? {} as Preferences),
    loaded: readonly(loaded)
  }
})