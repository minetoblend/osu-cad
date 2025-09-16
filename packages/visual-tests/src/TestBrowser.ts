import { Axes, Bindable, BindableWithCurrent, CompositeDrawable } from "@osucad/framework";
import { useTests } from "./collect";
import type { TestScene } from "./TestScene";

export class TestBrowser extends CompositeDrawable
{
  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  private readonly testScenes = useTests();

  private readonly activeTestSceneId = new Bindable<string>("");
  private readonly activeTestSceneClass = new BindableWithCurrent<(new () => TestScene) | undefined>(undefined);

  #activeTestScene?: TestScene;

  protected override loadComplete()
  {
    super.loadComplete();

    this.testScenes.bindValueChanged(e =>
    {
      if (!(this.activeTestSceneId.value in e.value))
        this.activeTestSceneId.value = Object.keys(e.value)[0];
    }, true);

    this.activeTestSceneId.bindValueChanged(e =>
    {
      if (e.value)
        void this.#loadTestScene(e.value);
    }, true);

    this.activeTestSceneClass.bindValueChanged(e =>
    {
      if (this.#activeTestScene)
        this.removeInternal(this.#activeTestScene);
      this.#activeTestScene = undefined;

      if (e.value)
      {
        console.log(`Test scene updated: ${e.value.name}`);
        this.addInternal(this.#activeTestScene = new e.value());
      }
    }, true);
  }

  #pending?: {
    cancel: () => void
  };

  async #loadTestScene(id: string)
  {
    const loader = this.testScenes.value[id];
    if (!loader)
      return;

    this.#pending?.cancel();

    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    this.#pending = {
      cancel: () =>
      {
        abortController.abort();
        this.#pending = undefined;
      },
    };

    if (abortSignal.aborted)
      return;

    const module = await loader();

    this.activeTestSceneClass.current = module.default.scene;
  }
}
