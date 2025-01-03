import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { IComposeTool } from '../compose';
import { Axes, Bindable, Container, provide } from 'osucad-framework';
import { Color } from 'pixi.js';
import { HitObjectComposer } from '../compose/HitObjectComposer';
import { IssueList } from './IssueList';
import { ModPost } from './objects/ModPost';
import { ModPostBlueprintContainer } from './objects/ModPostBlueprintContainer';
import { LineTool } from './tools/LineTool';
import { ModdingSelectTool } from './tools/ModdingSelectTool';
import { PenTool } from './tools/PenTool';
import { TextTool } from './tools/TextTool';

@provide(ModdingComposer)
export class ModdingComposer extends HitObjectComposer {
  @provide(ModPost)
  modPost = new ModPost();

  readonly activeColor = new Bindable(new Color(0xFFFFFF));

  protected override getTools(): IComposeTool[] {
    return [
      new ModdingSelectTool(),
      new PenTool(),
      new LineTool(),
      new TextTool(),
    ];
  }

  protected override createRightSidebar(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.3,
      child: new IssueList(),
    });
  }

  #settingsContainer!: Container;

  protected override createTopBar(): Drawable {
    return this.#settingsContainer = new Container({
      relativeSizeAxes: Axes.X,
      height: 54,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.timeline.blueprintContainer.readonly = true;
    this.drawableRuleset.playfield.add(new ModPostBlueprintContainer().with({
      depth: -Number.MAX_VALUE,
    }));
  }

  protected override loadComplete() {
    super.loadComplete();

    this.toolContainer.toolActivated.addListener((tool) => {
      this.#settingsContainer.clear();
      this.#settingsContainer.add(tool.createSettings());
    });
  }
}
