export interface TimingPointV1 {
    time: number
    timing?: {
        bpm: number
        signature: number
    }
    sv?: number
    volume?: number
}
