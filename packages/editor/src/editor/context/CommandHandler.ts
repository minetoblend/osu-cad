import { Beatmap } from '@osucad/common';
import { EditorContext } from './EditorContext';

export class CommandHandler {
  constructor(
    readonly context: EditorContext,
    readonly beatmap: Beatmap,
  ) {}
}
