import type { NoArgsConstructor } from '@osucad/common';
import { Anchor, Axes, Bindable, Box, Container, Invalidation, LayoutMember, dependencyLoader } from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { PlayfieldContainer } from '../../playfield/PlayfieldContainer';
import { EditorScreen } from '../EditorScreen';
import { Editor } from '../../Editor';
import { Timeline } from '../../timeline/Timeline';
import { Corner, EditorCornerPiece } from '../../EditorCornerPiece';
import { BeatSnapDivisorSelector } from '../../BeatSnapDivisorSelector';
import { TimelineZoomButtons } from '../../timeline/TimelineZoomButtons';
import { ComposeTogglesBar } from './ComposeTogglesBar';
import { ComposeToolBar } from './ComposeToolBar';
import { HitObjectComposer } from './HitObjectComposer';
import type { DrawableComposeTool } from './tools/DrawableComposeTool';
import type { ComposeTool } from './tools/ComposeTool';
import { SelectTool } from './tools/SelectTool';

export type ToolConstructor = NoArgsConstructor<DrawableComposeTool>;

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  #playfieldContainer!: PlayfieldContainer;
  #toolBar!: ComposeToolBar;
  #togglesBar!: ComposeTogglesBar;

  #composer!: HitObjectComposer;

  #content!: Container;

  get content() {
    return this.#content;
  }

  #activeTool = new Bindable<ComposeTool>(new SelectTool());

  #topBar!: Container;

  @dependencyLoader()
  init() {
    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      padding: {
        top: 75,
      },
    }));

    this.add((this.#playfieldContainer = new PlayfieldContainer()));
    this.add((this.#toolBar = new ComposeToolBar(this.#activeTool)));
    this.add((this.#togglesBar = new ComposeTogglesBar().apply({
      y: 10,
    })));
    this.#playfieldContainer.add(
      (this.#composer = new HitObjectComposer(this.#activeTool)),
    );

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    const timeline = new Timeline();

    this.addInternal(this.#topBar = new Container({
      relativeSizeAxes: Axes.X,
      height: 75,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x16161B,
          alpha: 0.35,
        }),
        timeline,
        new Container({
          relativeSizeAxes: Axes.Y,
          width: 200,
          padding: { bottom: -10 },
          anchor: Anchor.TopRight,
          origin: Anchor.TopRight,
          children: [
            new EditorCornerPiece({
              corner: Corner.TopRight,
              relativeSizeAxes: Axes.Both,
              filters: [filter],
              children: [
                new TimelineZoomButtons(timeline, {
                  relativeSizeAxes: Axes.Y,
                  width: 34,
                  padding: { horizontal: 4, vertical: 2 },
                }),
                new Container({
                  relativeSizeAxes: Axes.Both,
                  padding: { left: 30 },
                  child: new Container({
                    relativeSizeAxes: Axes.Both,
                    height: 0.5,
                    padding: { left: 20, right: 12, vertical: 4 },
                    child: new BeatSnapDivisorSelector(),
                  }),
                }),

              ],
            }),
          ],
        }),
        new Box({
          relativeSizeAxes: Axes.X,
          height: 1,
          color: 0x000000,
          alpha: 0.1,
        }),
      ],
    }));
  }

  protected loadComplete() {
    super.loadComplete();

    this.findClosestParentOfType(Editor)?.requestSelectTool.addListener(() =>
      this.#activeTool.value = new SelectTool(),
    );
  }

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.#playfieldContainer.padding = {
        horizontal: this.#toolBar.layoutSize.x,
        top: this.drawSize.x < 1250 ? 20 : 10,
        bottom: this.drawSize.x < 1110 ? 15 : -10,
      };
      this.#paddingBacking.validate();
    }
  }

  show() {
    super.show();

    this.#toolBar.x = -100;
    this.#toolBar.y = -70;
    this.#toolBar.moveTo({ x: 0, y: 0, duration: 750, easing: 'expo.out' });

    this.#togglesBar.x = 100;
    this.#togglesBar.y = -60;
    this.#togglesBar.moveTo({ x: 0, y: 10, duration: 750, easing: 'expo.out' });

    this.#topBar.y = -70;
    this.#topBar.moveTo({ y: 0, duration: 750, easing: 'expo.out' });

    this.#playfieldContainer.y = 100;
    this.#playfieldContainer.moveTo({ y: 0, duration: 750, easing: 'expo.out' });
  }

  hide() {
    super.hide();

    this.#toolBar.moveTo({ x: -100, y: -70, duration: 500, easing: 'expo.out' });
    this.#togglesBar.moveTo({ x: 100, y: -70, duration: 500, easing: 'expo.out' });

    this.#topBar.moveTo({ y: -70, duration: 500, easing: 'expo.out' });

    this.#playfieldContainer.moveTo({ y: 100, duration: 500, easing: 'expo.out' });
  }
}
