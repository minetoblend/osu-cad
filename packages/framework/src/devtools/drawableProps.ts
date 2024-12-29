import type { Properties } from '@pixi/devtools';
import type { Color } from 'pixi.js';
import type { IVec2 } from '../math';
import { anchorToString, parseAnchor } from '../graphics/drawables/Anchor';
import { axesToString, parseAxes } from '../graphics/drawables/Axes';
import { fillModeToString, parseFillMode } from '../graphics/drawables/FillMode';
import { MarginPadding } from '../graphics/drawables/MarginPadding';
import { Vec2 } from '../math';

export const drawableProps: Properties[] = [
  {
    prop: 'type',
    entry: {
      type: 'text',
      section: 'Drawable',
    },
  },
  {
    prop: 'position',
    entry: {
      type: 'vector2',
      section: 'Drawable',
      options: {
        x: { label: 'x' },
        y: { label: 'y' },
      },
    },
  },
  {
    prop: 'size',
    entry: {
      type: 'vector2',
      section: 'Drawable',
      options: {
        x: { label: 'width' },
        y: { label: 'height' },
      },
    },
  },
  {
    prop: 'scale',
    entry: {
      type: 'vector2',
      section: 'Drawable',
      options: {
        x: { label: 'x' },
        y: { label: 'y' },
      },
    },
  },
  {
    prop: 'rotation',
    entry: {
      type: 'number',
      section: 'Drawable',
    },
  },
  {
    prop: 'depth',
    entry: {
      type: 'number',
      section: 'Drawable',
    },
  },
  {
    prop: 'fillMode',
    entry: {
      type: 'select',
      section: 'Drawable',
      options: {
        options: [
          'Stretch',
          'Fill',
          'Fit',
        ],
      },
    },
  },
  {
    prop: 'fillAspectRatio',
    entry: {
      type: 'number',
      section: 'Drawable',
    },
  },
  {
    prop: 'color',
    entry: {
      type: 'color',
      section: 'Drawable',
    },
  },
  {
    prop: 'alwaysPresent',
    entry: {
      type: 'boolean',
      section: 'Drawable',
    },
  },
  {
    prop: 'relativeSizeAxes',
    entry: {
      type: 'select',
      section: 'Drawable',
      options: {
        options: ['None', 'X', 'Y', 'Both'],
      },
    },
  },
  {
    prop: 'relativePositionAxes',
    entry: {
      type: 'select',
      section: 'Drawable',
      options: {
        options: ['None', 'X', 'Y', 'Both'],
      },
    },
  },
  {
    prop: 'anchor',
    entry: {
      type: 'select',
      section: 'Drawable',
      options: {
        options: [
          'TopLeft',
          'TopCenter',
          'TopRight',
          'CenterLeft',
          'Center',
          'CenterRight',
          'BottomLeft',
          'BottomCenter',
          'BottomRight',
        ],
      },
    },
  },
  {
    prop: 'origin',
    entry: {
      type: 'select',
      section: 'Drawable',
      options: {
        options: [
          'TopLeft',
          'TopCenter',
          'TopRight',
          'CenterLeft',
          'Center',
          'CenterRight',
          'BottomLeft',
          'BottomCenter',
          'BottomRight',
        ],
      },
    },
  },
  {
    prop: 'margin',
    entry: {
      type: 'vectorX',
      section: 'Drawable',
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
];

const vec2ToArray = (p: IVec2) => [p.x, p.y];
const marginPaddingToArray = (p: MarginPadding) => [p.left, p.top, p.right, p.bottom];
const colorToNumber = (c: Color) => c.toNumber();

const arrayToVec2 = ([x, y]: number[]) => new Vec2(x, y);
const arrayToMarginPadding = ([left, top, right, bottom]: number[]) => new MarginPadding({ left, top, right, bottom });

export const propertyToValue: Record<string, (value: any) => any> = {
  position: vec2ToArray,
  size: vec2ToArray,
  scale: vec2ToArray,
  color: colorToNumber,
  fillMode: fillModeToString,
  relativePositionAxes: axesToString,
  relativeSizeAxes: axesToString,
  autoSizeAxes: axesToString,
  anchor: anchorToString,
  origin: anchorToString,
  margin: marginPaddingToArray,
  padding: marginPaddingToArray,
};

export const valueToProperty: Record<string, (value: any) => any> = {
  position: arrayToVec2,
  size: arrayToVec2,
  scale: arrayToVec2,
  fillMode: parseFillMode,
  relativePositionAxes: parseAxes,
  relativeSizeAxes: parseAxes,
  autoSizeAxes: parseAxes,
  anchor: parseAnchor,
  origin: parseAnchor,
  margin: arrayToMarginPadding,
  padding: arrayToMarginPadding,
};
