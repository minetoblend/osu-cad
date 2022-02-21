import {EditorContext} from "@/objects/Editor";
import {inject, Ref} from "vue";
import {ResourceProvider} from "@/draw";

export const injectContext = () => inject<Ref<EditorContext>>('context')!.value

export const injectResources = () => inject<ResourceProvider>('resources')!