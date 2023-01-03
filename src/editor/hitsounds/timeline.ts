import {HitSoundTrack, HitSoundTrackInstance} from "@/editor/hitsounds/track";

export interface HitSoundTimeline {

    lanes: HitSoundTimelineLayer[];

}

export interface HitSoundTimelineLayer {

    name: string
    tracks: HitSoundTrackInstance[]

}


export function createHitSoundLayer(name: string): HitSoundTimelineLayer {
    return {
        name,
        tracks: []
    }
}
