import {defaultPreferences, Preferences} from "@osucad/common";

export const usePreferences = createGlobalState(() => {
  const preferences = useLocalStorage('preferences', defaultPreferences(), {
    deep: true,
    mergeDefaults: true,
    writeDefaults: true,
  })

  mergeRecursive(preferences.value, defaultPreferences())

  const loaded = ref(true)

  let nonReactivePreferences: Preferences | undefined = undefined

  watch(preferences, (preferences) => {
    nonReactivePreferences = JSON.parse(JSON.stringify(preferences))
  }, {immediate: true, deep: true})

  return {
    preferences: reactiveComputed<Preferences>(() => preferences.value ?? {} as Preferences),
    get nonReactivePreferences() {
      return nonReactivePreferences as unknown as Preferences
    },
    loaded: readonly(loaded)
  }
})

function mergeRecursive(obj: any, defaults: any) {
  for (const key in defaults) {
    if (typeof obj[key] === 'object' && typeof defaults[key] === 'object') {
      mergeRecursive(obj[key], defaults[key])
    } else if (obj[key] === undefined) {
      obj[key] = defaults[key]
    }
  }
}