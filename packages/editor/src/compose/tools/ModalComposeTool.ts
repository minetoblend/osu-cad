import { ComposeTool } from "./ComposeTool";
import { Action } from "@osucad/framework";

export abstract class ModalComposeTool<Result = void> extends ComposeTool
{
  public readonly onComplete = new Action<[Result | undefined]>();

  #completed = false;

  public get completed()
  {
    return this.#completed;
  }

  public complete(result?: Result)
  {
    if(this.completed)
      return;

    this.#completed = true;
    this.onCompleted(result);
    this.onComplete.emit(result);
    this.exit();
  }

  public cancel()
  {
    if (this.completed)
      return;

    this.#completed = true;
    this.onCanceled();
    this.exit();
  }

  protected exit()
  {
    if (this.toolContainer.activeSubTool === this)
      this.toolContainer.pop();
  }

  public override onExiting(next?: ComposeTool)
  {
    super.onExiting(next);

    if (!this.completed)
    {
      this.#completed = true;
      this.onCanceled();
      this.onComplete.emit(undefined);
    }
  }

  protected onCompleted(result?: Result)
  {
  }

  protected onCanceled()
  {
  }
}
