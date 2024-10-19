import type { Properties } from '@pixi/devtools';
import { EasingFunction } from '../graphics';

export const DevToolProps = {
  easingFunction(prop: string, section: string): Properties {
    return {
      prop,
      entry: {
        type: 'select',
        section,
        options: {
          options: [
            'None',
            'Default',
            'In',
            'InQuad',
            'Out',
            'OutQuad',
            'InOutQuad',
            'InCubic',
            'OutCubic',
            'InOutCubic',
            'InQuart',
            'OutQuart',
            'InOutQuart',
            'InQuint',
            'OutQuint',
            'InOutQuint',
            'InSine',
            'OutSine',
            'InOutSine',
            'InExpo',
            'OutExpo',
            'InOutExpo',
            'InCirc',
            'OutCirc',
            'InOutCirc',
            'InElastic',
            'OutElastic',
            'InBack',
            'OutBack',
            'InOutBack',
            'InBounce',
            'OutBounce',
            'InOutBounce',
            'OutPow10',
          ],
        },
      },
    };
  },
};

export function easingFunctionToString(fn: EasingFunction) {
  return Object.entries(EasingFunction).find(it => it[1] === fn)?.[0];
}
