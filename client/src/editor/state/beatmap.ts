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

}