export interface TimingPointV1 {
    id: string
    time: number
    timing?: {
        bpm: number
        signature: number
    }
    sv?: number
    volume?: number
}
