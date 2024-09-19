import {
  Anchor,
  Axes,
  Bindable,
  Box,
  Container,
  dependencyLoader,
  EasingFunction,
  Invalidation,
  LayoutMember,
  Vec2,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { EditorScreen } from '../EditorScreen';
import { Editor } from '../../Editor';
import { Corner, EditorCornerPiece } from '../../EditorCornerPiece';
import { BeatSnapDivisorSelector } from '../../BeatSnapDivisorSelector';
import { TimelineZoomButtons } from '../../timeline/TimelineZoomButtons';
import { ComposeTogglesBar } from './ComposeTogglesBar';
import { ComposeToolBar } from './ComposeToolBar';
import { HitObjectComposer } from './HitObjectComposer';
import type { ComposeTool } from './tools/ComposeTool';
import { SelectTool } from './tools/SelectTool';
import { ComposeScreenTimeline } from '../../timeline/ComposeScreenTimeline.ts';

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  #toolBar!: ComposeToolBar;
  #togglesBar!: ComposeTogglesBar;

  #composer!: HitObjectComposer;

  #content!: Container;

  get content() {
    return this.#content;
  }

  #activeTool = new Bindable<ComposeTool>(new SelectTool());

  #topBar!: Container;

  compactTimeline = new BindableBoolean();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  init() {
    this.config.bindWith(OsucadSettings.CompactTimeline, this.compactTimeline);

    const selection = new EditorSelection();
    this.dependencies.provide(EditorSelection, selection);

    this.addInternal(selection);

    const hitSoundPlayer = new HitsoundPlayer();
    this.dependencies.provide(HitsoundPlayer, hitSoundPlayer);
    this.addInternal(hitSoundPlayer);

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      padding: {
        top: 75,
      },
    }));
    this.add(this.#composer = new HitObjectComposer(this.#activeTool));
    this.add((this.#toolBar = new ComposeToolBar(this.#activeTool)));
    this.add((this.#togglesBar = new ComposeTogglesBar().with({
      y: 10,
    })));

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    const timeline = new ComposeScreenTimeline();

    this.addInternal(
      this.#topBar = new Container({
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
      }),
    );

    this.compactTimeline.addOnChangeListener((e) => {
      this.transformTo('timelineHeight', e.value ? 60 : 75, 200, EasingFunction.OutExpo);
    }, { immediate: true });
  }

  protected loadComplete() {
    super.loadComplete();

    this.findClosestParentOfType(Editor)?.requestSelectTool.addListener(() =>
      this.#activeTool.value = new SelectTool(),
    );
  }

  get timelineHeight() {
    return this.#topBar.height;
  }

  set timelineHeight(value) {
    this.#topBar.height = value;
    this.#content.padding = { top: value };
  }

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.#composer.padding = {
        horizontal: this.#toolBar.layoutSize.x,
        top: this.drawSize.x < 1250 ? 20 : 10,
        bottom: this.drawSize.x < 1110 ? 15 : -10,
      };
      this.#paddingBacking.validate();
    }
  }

  show() {
    super.show();

    this.#toolBar.moveTo(new Vec2(-100, -70)).moveTo(new Vec2(), 500, EasingFunction.OutExpo);

    this.#togglesBar.moveTo(new Vec2(100, -60)).moveTo(new Vec2(0, 10), 500, EasingFunction.OutExpo);

    this.#topBar.moveToY(-70).moveToY(0, 500, EasingFunction.OutExpo);

    this.#composer.moveToY(100).moveToY(0, 500, EasingFunction.OutExpo);
    this.#composer.fadeInFromZero(400)
  }

  hide() {
    super.hide();

    this.#toolBar.moveTo(new Vec2(-100, -70), 500, EasingFunction.OutExpo);
    this.#togglesBar.moveTo(new Vec2(100, -60), 500, EasingFunction.OutExpo);

    this.#topBar.moveToY(-70, 500, EasingFunction.OutExpo);

    this.#composer.moveToY(100, 500, EasingFunction.OutExpo);
  }
}
