import {createSharedComposable} from "@vueuse/core";
import {Capacitor} from "@capacitor/core";


export function usePlatform() {
    const platform = Capacitor.getPlatform() as 'web' | 'android' | 'ios';

    return {
        platform,
        isWeb: platform === 'web',
        isMobile: platform !== 'web',
    }
}
