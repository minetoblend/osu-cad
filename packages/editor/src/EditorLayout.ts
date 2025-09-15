import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader } from "@osucad/framework";
import { EditorBottomBar } from "./bottomBar/EditorBottomBar";
import { ComposeScreen } from "./compose";

export class EditorLayout extends CompositeDrawable
{
  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { bottom: EditorBottomBar.HEIGHT },
        child: new ComposeScreen(),
      }),
      new EditorBottomBar().with({
        anchor: Anchor.BottomCenter,
        origin: Anchor.BottomCenter,
      }),
    ];
  }
}
