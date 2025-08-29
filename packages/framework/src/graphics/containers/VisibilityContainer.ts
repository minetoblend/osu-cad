import { Bindable, type ValueChangedEvent } from "../../bindables/Bindable";
import { Container } from "./Container";

export abstract class VisibilityContainer extends Container
{
  public readonly state = new Bindable<Visibility>(Visibility.Hidden);

  #didInitialHide = false;

  protected get startHidden()
  {
    return this.state.value === Visibility.Hidden;
  }

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();

    if (this.startHidden)
    {
      this.popOut();
      this.finishTransforms(true);
      this.#didInitialHide = true;
    }
  }

  protected override loadComplete()
  {
    this.state.bindValueChanged(this.#updateState, this, this.state.value === Visibility.Hidden && !this.#didInitialHide);

    super.loadComplete();
  }

  public override show()
  {
    this.state.value = Visibility.Visible;
  }

  public override hide()
  {
    this.state.value = Visibility.Hidden;
  }

  public toggleVisibility()
  {
    this.state.value = this.state.value === Visibility.Visible ? Visibility.Hidden : Visibility.Visible;
  }

  public override get propagateNonPositionalInputSubTree()
  {
    return this.state.value === Visibility.Visible;
  }

  public override get propagatePositionalInputSubTree()
  {
    return this.state.value === Visibility.Visible;
  }

  protected abstract popIn(): void;

  protected abstract popOut(): void;

  #updateState(event: ValueChangedEvent<Visibility>)
  {
    switch (event.value)
    {
    case Visibility.Visible:
      this.popIn();
      break;
    case Visibility.Hidden:
      this.popOut();
      break;
    }
  };
}

export enum Visibility
{
  Hidden = 0,
  Visible = 1,
}
