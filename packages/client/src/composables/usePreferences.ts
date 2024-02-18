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

  watchEffect(() => {
    nonReactivePreferences = JSON.parse(JSON.stringify(preferences.value))
  })

  return {
    preferences: reactiveComputed<Preferences>(() => preferences.value ?? {} as Preferences),
    nonReactivePreferences: nonReactivePreferences as unknown as Preferences,
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