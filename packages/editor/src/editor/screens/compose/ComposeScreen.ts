import type {
  KeyDownEvent,
} from 'osucad-framework';
import type { ComposeTool } from './tools/ComposeTool';
import {
  Anchor,
  Axes,
  Bindable,
  BindableBoolean,
  Box,
  Container,
  dependencyLoader,
  EasingFunction,
  Invalidation,
  Key,
  LayoutMember,
  resolved,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { OsucadConfigManager } from '../../../config/OsucadConfigManager';
import { OsucadSettings } from '../../../config/OsucadSettings';
import { BeatSnapDivisorSelector } from '../../BeatSnapDivisorSelector';
import { Corner, EditorCornerPiece } from '../../EditorCornerPiece';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import { ComposeScreenTimeline } from '../../timeline/ComposeScreenTimeline';
import { TimelineZoomButtons } from '../../timeline/TimelineZoomButtons';
import { EditorScreen } from '../EditorScreen';
import { EditorSelection } from './EditorSelection';
import { HitObjectComposer } from './HitObjectComposer';
import { SelectTool } from './tools/SelectTool';

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);
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
    // this.add((this.#toolBar = new ComposeToolBar(this.#activeTool)));
    // this.add((this.#togglesBar = new ComposeTogglesBar().with({
    //   y: 10,
    // })));

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    const timeline = this.timeline = new ComposeScreenTimeline();

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

    this.editor.requestSelectTool.addListener(() =>
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
        top: this.drawSize.x < 1250 ? 20 : 10,
        bottom: this.drawSize.x < 1110 ? 15 : -10,
      };
      this.#paddingBacking.validate();
    }
  }

  show() {
    super.show();

    this.#topBar.moveToY(-70).moveToY(0, 500, EasingFunction.OutExpo);

    this.#composer.show();
  }

  hide() {
    super.hide();

    this.#topBar.moveToY(-70, 500, EasingFunction.OutExpo);

    this.#composer.hide();
  }

  timeline!: ComposeScreenTimeline;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.F4) {
      this.timeline.alpha = this.timeline.alpha === 0 ? 1 : 0;
      return true;
    }

    return false;
  }
}
