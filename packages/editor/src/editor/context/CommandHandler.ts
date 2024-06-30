import { Beatmap } from '@osucad/common';
import { EditorContext } from './EditorContext';
import { Bindable } from 'osucad-framework';

export class CommandHandler {
  constructor(
    readonly context: EditorContext,
    readonly beatmap: Beatmap,
  ) {}

  readonly canUndo = new Bindable(false);

  readonly canRedo = new Bindable(false);
}
