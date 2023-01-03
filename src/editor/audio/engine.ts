import {createGlobalState} from "@vueuse/core";

export class AudioEngine {
    readonly ctx = new AudioContext();

    get destination() {
        return this.ctx.destination;
    }
}

export const useAudioEngine = createGlobalState(() => {
    return new AudioEngine();
})
