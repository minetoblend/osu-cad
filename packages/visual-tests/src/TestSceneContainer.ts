import type { Bindable } from "@osucad/framework";
import { Axes, CompositeDrawable } from "@osucad/framework";
import type { TestScene } from "./TestScene";

export class TestSceneContainer extends CompositeDrawable
{
  public readonly testSceneClass: Bindable<(new () => TestScene) | undefined>;

  public constructor(
    testSceneClass: Bindable<(new () => TestScene) | undefined>,
  )
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.testSceneClass = testSceneClass.getBoundCopy();
  }

  #activeTestScene?: TestScene;
  #pendingTestScene?: {
    cancel: () => void
  };

  protected override loadComplete()
  {
    super.loadComplete();

    this.testSceneClass.bindValueChanged(e =>
    {
      if (this.#activeTestScene)
        this.removeInternal(this.#activeTestScene);
      this.#activeTestScene = undefined;

      this.#pendingTestScene?.cancel();

      if (e.value)
        void this.#loadTestScene(new e.value());
    }, true);
  }


  async #loadTestScene(testScene: TestScene)
  {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    this.#pendingTestScene = {
      cancel: () =>
      {
        abortController.abort();
        this.#pendingTestScene = undefined;
      },
    };

    await this.loadComponentAsync(testScene);

    if (!abortSignal.aborted)
    {
      this.addInternal(this.#activeTestScene = testScene);
    }
  }
}
