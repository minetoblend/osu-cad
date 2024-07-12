import { Action, Axes, resolved } from 'osucad-framework';
import { CommandContainer } from '../../../../CommandContainer';
import { ThemeColors } from '../../../../ThemeColors';

export class ComposeToolInteraction extends CommandContainer {
  readonly completed = new Action<ComposeToolInteraction>();
  readonly cancelled = new Action<ComposeToolInteraction>();

  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  receivePositionalInputAt(): boolean {
    return true;
  }

  complete() {
    this.commit();
    this.hide();
    this.expire();

    this.completed.emit(this);
  }

  cancel() {
    this.commandManager.undoCurrentTransaction();
    this.hide();
    this.expire();

    this.cancelled.emit(this);
  }
}
