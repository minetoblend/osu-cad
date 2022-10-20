import {SerializedBeatmap} from "@common/types";
import {TimingManager} from "@/editor/state/timing";
import {HitObjectManager} from "@/editor/state/hitobject.state";
import {DifficultyManager} from "@/editor/state/difficulty";
import {EditorContext} from "@/editor";
import {MetadataManager} from "@/editor/state/metadata";

export class BeatmapState {

    constructor(readonly ctx: EditorContext) {
        this.difficulty = new DifficultyManager(this.ctx)
        this.timing = new TimingManager(this.ctx)
        this.hitobjects = new HitObjectManager(this.ctx)
        this.metadata = new MetadataManager(this.ctx)
    }

    readonly timing
    readonly hitobjects
    readonly difficulty
    readonly metadata

    update(state: SerializedBeatmap) {
        console.log(state)
        this.difficulty.initFrom(state.difficulty)
        this.timing.initFrom(state.timingPoints)
        this.hitobjects.initFrom(state.hitObjects)
        this.metadata.initFrom(state.metadata)
    }

}