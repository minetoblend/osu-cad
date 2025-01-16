import type { ClickEvent } from '@osucad/framework';
import { EditorButton, TernaryState } from '@osucad/core';
import { Bindable } from '@osucad/framework';

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
