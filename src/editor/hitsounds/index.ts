import {reactive} from "vue";

export * from './track';
export * from './manager'

export function createHitSoundState() {

    const track = reactive({
        name: 'Default',
        channels: [
            {
                name: 'soft',
                enabled: true,
                volume: 1,
                color: '#63E2B7',
                samples: [
                    1000
                ]
            },
            {
                name: 'soft–whistle',
                enabled: true,
                volume: 1,
                color: '#63E2B7',
                samples: [
                    1000
                ]
            },
            {
                name: 'soft–finish',
                enabled: true,
                volume: 1,
                color: '#63E2B7',
                samples: [
                    1000
                ]
            },
            {
                name: 'soft–clap',
                enabled: true,
                volume: 1,
                color: '#63E2B7',
                samples: [
                    1000
                ]
            },

            {
                name: 'normal',
                enabled: true,
                volume: 1,
                color: '#FE7C9A',
                samples: [
                    1000
                ]
            },
            {
                name: 'normal–whistle',
                enabled: true,
                volume: 1,
                color: '#FE7C9A',
                samples: [
                    1000
                ]
            },
            {
                name: 'normal–finish',
                enabled: true,
                volume: 1,
                color: '#FE7C9A',
                samples: [
                    1000
                ]
            },
            {
                name: 'normal–clap',
                enabled: true,
                volume: 1,
                color: '#FE7C9A',
                samples: [
                    1000
                ]
            }
        ]
    });

    return {
        track
    }
}

export type HitSoundState = ReturnType<typeof createHitSoundState>
