import { Bindable } from "./Bindable";

export class BindableBoolean extends Bindable<boolean>
{
  public constructor(defaultValue: boolean = false)
  {
    super(defaultValue);
  }

  public toggle()
  {
    this.value = !this.value;
  }

  public override createInstance(): BindableBoolean
  {
    return new BindableBoolean();
  }

  public override getBoundCopy(): BindableBoolean
  {
    return super.getBoundCopy() as BindableBoolean;
  }
}
