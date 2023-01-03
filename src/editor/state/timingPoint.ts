export interface TimingPoint {
    id: number
    offset: number
    timing: TimingInformation | null

    volume: number | null

    sliderVelocity: number | null;
}

export interface TimingInformation {
    bpm: number
    signature: number
}
