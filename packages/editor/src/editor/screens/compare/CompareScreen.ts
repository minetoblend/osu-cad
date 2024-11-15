import type { OsuPlayfield } from '@osucad/common';
import type { Bindable, DependencyContainer, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { DifficultyInfo } from '../../EditorBeatmap';
import type { BackgroundAdjustment } from '../BackgroundAdjustment';
import { Anchor, Axes, BindableBoolean, Container, dependencyLoader, DrawSizePreservingFillContainer, EasingFunction, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { Color } from 'pixi.js';
import { BeatmapComboProcessor } from '../../../beatmap/beatmapProcessors/BeatmapComboProcessor';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { DropdownItem, DropdownSelect } from '../../../userInterface/DropdownSelect';
import { Toggle } from '../../../userInterface/Toggle';
import { EditorDependencies } from '../../EditorDependencies';
import { PlayfieldGrid } from '../../playfield/PlayfieldGrid';
import { EditorScreen } from '../EditorScreen';
import { EditorScreenUtils } from '../EditorScreenUtils';
import { SecondaryPlayfield } from './SecondaryPlayfield';

export class CompareScreen extends EditorScreen {
  protected playfield!: OsuPlayfield;

  @resolved(BeatmapComboProcessor)
  comboProcessor!: BeatmapComboProcessor;

  splitView = new BindableBoolean(true);

  secondaryDifficulty!: Bindable<DifficultyInfo | null>;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { reusablePlayfield, otherDifficulties, secondaryDifficulty } = dependencies.resolve(EditorDependencies);

    this.playfield = reusablePlayfield;

    this.secondaryDifficulty = secondaryDifficulty.getBoundCopy();

    this.addAllInternal(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        height: 40,
        padding: 5,
        depth: -1,
        spacing: new Vec2(8),
        children: [
          new Container({
            width: 300,
            height: 30,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            child: this.#difficultySelect = new DropdownSelect<DifficultyInfo>({
              items: otherDifficulties.map(it => new DropdownItem(it.difficultyName, it)),
            }),
          }),
          new OsucadSpriteText({
            text: 'Split View',
            fontSize: 14,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new Toggle()
            .with({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            })
            .adjust(it => it.current = this.splitView),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 40 },
        children: [
          this.#leftContainer = new Container({
            relativeSizeAxes: Axes.Both,
            width: 0.5,
            padding: 40,
            children: [
              new DrawSizePreservingFillContainer({
                targetDrawSize: { x: 512, y: 384 },
                child: this.#leftPlayfieldContainer = new Container({
                  width: 512,
                  height: 384,
                  anchor: Anchor.Center,
                  origin: Anchor.Center,
                  children: [new PlayfieldGrid()],
                }),
              }),
            ],
          }),
          this.#rightContainer = new Container({
            relativeSizeAxes: Axes.Both,
            width: 0.5,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            padding: 40,
            child: new DrawSizePreservingFillContainer({
              targetDrawSize: { x: 512, y: 384 },
              child: new DrawSizePreservingFillContainer({
                targetDrawSize: { x: 512, y: 384 },
                child: this.#rightPlayfieldContainer = new Container({
                  width: 512,
                  height: 384,
                  anchor: Anchor.Center,
                  origin: Anchor.Center,
                  children: [
                    this.#secondGrid = new PlayfieldGrid(),
                  ],
                }),
              }),
            }),
          }),
        ],
      }),
    );

    this.secondaryDifficulty.addOnChangeListener((evt) => {
      if (this.#rightPlayfield) {
        this.#rightPlayfield
          .fadeOut(200)
          .expire();
      }

      if (evt.value) {
        this.#rightPlayfieldContainer.add(this.#rightPlayfield = new SecondaryPlayfield(evt.value));
      }
    }, { immediate: true });

    this.splitView.addOnChangeListener((e) => {
      if (e.value) {
        this.#leftContainer.resizeWidthTo(0.5, 500, EasingFunction.OutExpo);
        this.#rightContainer.resizeWidthTo(0.5, 500, EasingFunction.OutExpo);
        this.#secondGrid.fadeIn(500);

        this.comboProcessor.comboColorsOverride = null;
        this.#rightPlayfield!.comboProcessor.comboColorsOverride = null;
      }
      else {
        this.#leftContainer.resizeWidthTo(1, 500, EasingFunction.OutExpo);
        this.#rightContainer.resizeWidthTo(1, 500, EasingFunction.OutExpo);
        this.#secondGrid.fadeOut(500);

        this.comboProcessor.comboColorsOverride = [
          new Color(0xD90B2D),
          new Color(0xFF4D6A),
        ];

        this.#rightPlayfield!.comboProcessor.comboColorsOverride = [
          new Color(0x0039B5),
          new Color(0x457FFF),
        ];
      }
    });
  }

  protected loadComplete() {
    super.loadComplete();

    this.#difficultySelect.current = this.secondaryDifficulty;
  }

  #difficultySelect!: DropdownSelect<DifficultyInfo>;

  #secondGrid!: PlayfieldGrid;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    if (this.playfield.parent) {
      EditorScreenUtils.matchScreenSpaceDrawQuad(this.playfield.parent, this.#leftPlayfieldContainer, true);
      EditorScreenUtils.matchScreenSpaceDrawQuad(this.playfield.parent, this.#rightPlayfieldContainer, true);
    }

    EditorScreenUtils.insertPlayfield(this.playfield, this.#leftPlayfieldContainer);
    this.#leftPlayfield = this.playfield;
  }

  #leftContainer!: Container;

  #rightContainer!: Container;

  #leftPlayfield: OsuPlayfield | null = null;

  #rightPlayfield: SecondaryPlayfield | null = null;

  #leftPlayfieldContainer!: Container;

  #rightPlayfieldContainer!: Container;

  protected adjustBackground(background: BackgroundAdjustment) {
    background.scale = 1.1;
  }

  onExiting(e: ScreenExitEvent): boolean {
    this.comboProcessor.comboColorsOverride = null;
    if (this.#rightPlayfield)
      this.#rightPlayfield.comboProcessor.comboColorsOverride = null;

    return super.onExiting(e);
  }
}
