import { Bindable, type ValueChangedEvent } from '../../bindables/Bindable';
import { Container } from './Container';

export abstract class VisibilityContainer extends Container {
  readonly state = new Bindable<Visibility>(Visibility.Hidden);
  #didInitialHide = false;

  protected get startHidden() {
    return this.state.value === Visibility.Hidden;
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    if (this.startHidden) {
      this.popOut();
      this.finishTransforms(true);
      this.#didInitialHide = true;
    }
  }

  override loadComplete() {
    this.state.bindValueChanged(this.updateState, this.state.value === Visibility.Hidden && !this.#didInitialHide);

    super.loadComplete();
  }

  override show() {
    this.state.value = Visibility.Visible;
  }

  override hide() {
    this.state.value = Visibility.Hidden;
  }

  toggleVisibility() {
    this.state.value = this.state.value === Visibility.Visible ? Visibility.Hidden : Visibility.Visible;
  }

  override get propagateNonPositionalInputSubTree() {
    return this.state.value === Visibility.Visible;
  }

  override get propagatePositionalInputSubTree() {
    return this.state.value === Visibility.Visible;
  }

  abstract popIn(): void;

  abstract popOut(): void;

  updateState = (event: ValueChangedEvent<Visibility>) => {
    switch (event.value) {
      case Visibility.Visible:
        this.popIn();
        break;
      case Visibility.Hidden:
        this.popOut();
        break;
    }
  };
}

export enum Visibility {
  Hidden = 0,
  Visible = 1,
}
