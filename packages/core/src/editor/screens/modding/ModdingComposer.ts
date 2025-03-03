import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { IComposeTool } from '../compose';
import { Axes, Bindable, Container, provide } from '@osucad/framework';
import { Color } from 'pixi.js';
import { EditorNavigation } from '../../EditorNavigation';
import { HitObjectComposer } from '../compose/HitObjectComposer';
import { ModPost } from './objects/ModPost';
import { ModPostBlueprintContainer } from './objects/ModPostBlueprintContainer';
import { SnapSettings } from './SnapSettings';
import { LineTool } from './tools/LineTool';
import { ModdingSelectTool } from './tools/ModdingSelectTool';
import { PenTool } from './tools/PenTool';

@provide(ModdingComposer)
export class ModdingComposer extends HitObjectComposer {
  @provide(ModPost)
  modPost = new ModPost();

  @provide()
  snapSettings = new SnapSettings();

  readonly activeColor = new Bindable(new Color(0xFFFFFF));

  protected override getTools(): IComposeTool[] {
    return [
      new ModdingSelectTool(),
      new PenTool(),
      new LineTool(),
    ];
  }

  #settingsContainer!: Container;

  protected override createMainContent(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        new Container({
          relativeSizeAxes: Axes.Both,
          padding: { top: 54 },
          child: super.createMainContent(),
        }),
        this.#settingsContainer = new Container({
          relativeSizeAxes: Axes.X,
          height: 54,
        }),
      ],
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    // overriding the global navigation because we might be on a different beatmap
    this.addInternal(new EditorNavigation().with({
      depth: 1,
    }));

    if (this.timeline.blueprintContainer)
      this.timeline.blueprintContainer.readonly = true;
    this.drawableRuleset.playfield.addAll(
      new ModPostBlueprintContainer().with({
        depth: -Number.MAX_VALUE,
      }),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.toolContainer.toolActivated.addListener((tool) => {
      this.#settingsContainer.clear();
      this.#settingsContainer.add(tool.createSettings());
    });
  }
}
