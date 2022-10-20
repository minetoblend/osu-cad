import {watchEffect, WatchStopHandle} from "vue";
import {WatchEffect, WatchOptionsBase} from "@vue/runtime-core";


export class WatchPool {

    stopHandles: WatchStopHandle[] = []

    watchEffect(effect: WatchEffect, options?: WatchOptionsBase) {
        this.stopHandles.push(watchEffect(effect, options))
    }

    add(stopHandle: WatchStopHandle) {
        this.stopHandles.push(stopHandle)
    }

    stop() {
        this.stopHandles.forEach(it => it())
        this.stopHandles = []
    }

}