import {reactive, toRef, UnwrapRef} from "vue";


const globalConfig = reactive({
    gridSize: 'medium' as GridSize,
    hitAnimationsEnabled: false,
})

type GridSize = 'tiny' | 'small' | 'medium' | 'large'

export function useGlobalConfig<T extends keyof typeof globalConfig>(key: T) {
    return toRef(globalConfig, key)
}
