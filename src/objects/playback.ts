import { AudioEngine, Sound } from "@/audio";
import { ref, Ref } from "vue";
import { EditorContext } from "./Editor";

export class PlaybackManager {
    audioEngine: AudioEngine;
    isPlaying: Ref<boolean>;
    currentTime: Ref<number> = ref(0);

    constructor(readonly context: EditorContext, readonly song: Sound) {
        this.audioEngine = song.engine
        this.isPlaying = song.isPlaying
        this.update()
    }

    update() {
        if(this.currentTime.value !== Math.floor(this.song.currentTime * 1000)) {
            this.currentTime.value = Math.floor(this.song.currentTime * 1000)
        }
        window.requestAnimationFrame(() => this.update())
    }
    
    play() {
        this.song.play()
    }

    pause() {
        this.song.pause()
    }

    seekRelative(time: number) {
        this.seek(time * this.context.songDuration.value)
    }

    seek(time: number) {
        console.log(time)
        this.song.seek(time / 1000)
    }
}