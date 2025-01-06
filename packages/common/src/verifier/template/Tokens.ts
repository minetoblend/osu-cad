import type { Formatter } from './Formatter';

export type FormatToken =
  | string
  | {
    type: 'placeholder';
    index: number;
    format?: Formatter;
  };
