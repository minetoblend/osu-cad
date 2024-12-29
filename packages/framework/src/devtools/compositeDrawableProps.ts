import type { Properties } from '@pixi/devtools';
import { drawableProps } from './drawableProps';

export const compositeDrawableProps: Properties[] = [
  ...drawableProps,
  {
    prop: 'internalChildrenCount',
    entry: {
      type: 'number',
      section: 'CompositeDrawable',
    },
  },
  {
    prop: 'aliveInternalChildrenCount',
    entry: {
      type: 'number',
      section: 'CompositeDrawable',
    },
  },
  {
    prop: 'padding',
    entry: {
      type: 'vectorX',
      section: 'CompositeDrawable',
      options: {
        inputs: [
          { label: 'left' },
          { label: 'top' },
          { label: 'right' },
          { label: 'bottom' },
        ],
      },
    },
  },
  {
    prop: 'autoSizeAxes',
    entry: {
      type: 'select',
      section: 'CompositeDrawable',
      options: {
        options: ['None', 'X', 'Y', 'Both'],
      },
    },
  },
];
