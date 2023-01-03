export interface HitSoundTrack {
    name: string
}

export interface HitSoundTrackInstance {
    track: HitSoundTrack
    offset: number
}

export interface SimpleHitSoundTrack extends HitSoundTrack {

}

export function createSimpleHitSoundTrack(name: string): SimpleHitSoundTrack {
    return {
        name,
    }
}
