import type { ClickEvent } from "@osucad/framework";
import { Anchor, Axes, BasicScrollContainer, Bindable, BindableWithCurrent, Box, CompositeDrawable, Container, Direction, FillDirection, FillFlowContainer, SpriteText } from "@osucad/framework";
import type { TestSceneWrapper } from "./collect";
import type { TestScene } from "./TestScene";
import { TestSceneContainer } from "./TestSceneContainer";

export class TestBrowser extends CompositeDrawable
{
  readonly #buttons: FillFlowContainer;

  public constructor(
    private readonly testScenes: Bindable<Record<string, () => Promise<TestSceneWrapper>>>,
  )
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    import("./style.css");

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 200 },
        child: new TestSceneContainer(this.activeTestSceneClass),
      }),
      new Container({
        width: 200,
        relativeSizeAxes: Axes.Y,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: "rgb(30, 57, 52)",
          }),
          new BasicScrollContainer(Direction.Vertical).with({
            relativeSizeAxes: Axes.Both,
            child: this.#buttons = new FillFlowContainer({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              direction: FillDirection.Vertical,
            }),
          }),
        ],
      }),
    ];
  }

  private readonly activeTestSceneId = new Bindable<string>(window.location.hash?.slice(1));
  private readonly activeTestSceneClass = new BindableWithCurrent<(new () => TestScene) | undefined>(undefined);

  protected override loadComplete()
  {
    super.loadComplete();

    this.testScenes.bindValueChanged(e =>
    {
      if (!(this.activeTestSceneId.value in e.value))
        this.activeTestSceneId.value = Object.keys(e.value)[0];

      this.#buttons.clear();
      for (const key in e.value)
        this.#buttons.add(new TestButton(key, this.activeTestSceneId));
    }, true);

    this.activeTestSceneId.bindValueChanged(e =>
    {
      if (e.value)
        void this.#loadTestScene(e.value);
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

    history.replaceState({}, "", location.pathname + "#" + id);

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

class TestButton extends CompositeDrawable
{
  public constructor(
    private readonly module: string,
    activeTest: Bindable<string>,
  )
  {
    super();

    const name = module
      .split("/")
      .pop()!
      .split(".")
      .slice(0, -1)
      .join(".")
      .slice(0, -".testscene".length);

    this.activeTest = activeTest.getBoundCopy();


    this.autoSizeAxes = Axes.Y;
    this.relativeSizeAxes = Axes.X;

    this.internalChildren = [
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
        color: "rgb(51, 88, 96)",
        alpha: 0,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { horizontal: 10, vertical: 3 },
        child: new SpriteText({
          text: name,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          style: {
            fill: "rgb(250, 221, 114)",
            fontSize: 18,
          },
        }),
      }),
    ];
  }

  readonly #background: Box;

  private readonly activeTest: Bindable<string>;

  protected override loadComplete()
  {
    super.loadComplete();

    this.activeTest.bindValueChanged(e =>
    {
      this.#background.alpha = e.value === this.module ? 1 : 0;
    },true);
  }

  protected override onClick(e: ClickEvent): boolean
  {
    this.activeTest.value = this.module;
    return true;
  }
}
