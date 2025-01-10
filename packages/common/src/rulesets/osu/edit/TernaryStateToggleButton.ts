import type { ClickEvent } from 'osucad-framework';
import { Bindable } from 'osucad-framework';
import { EditorButton } from '../../../editor/screens/compose/EditorButton';
import { TernaryState } from '../../../utils/TernaryState';

export abstract class TernaryStateToggleButton extends EditorButton {
  readonly ternaryState = new Bindable(TernaryState.Inactive);

  protected override loadComplete() {
    super.loadComplete();

    this.ternaryState.bindValueChanged(newCombo => this.active.value = newCombo.value === TernaryState.Active, true);
  }

  toggleState() {
    if (this.ternaryState.value === TernaryState.Active)
      this.ternaryState.value = TernaryState.Inactive;
    else
      this.ternaryState.value = TernaryState.Active;
  }

  override onClick(e: ClickEvent): boolean {
    this.toggleState();
    return true;
  }
}
