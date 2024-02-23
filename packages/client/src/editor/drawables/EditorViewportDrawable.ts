import { Drawable } from './Drawable.ts';
import { ISize, Rect } from '@osucad/common';
import { ScaleToFitContainer } from './scaleToFitContainer.ts';
import { VIEWPORT_SIZE } from './injectionKeys.ts';
import { PlayfieldGrid } from './playfieldGrid.ts';
import { Provide } from './di';
import { Container, Point } from 'pixi.js';
import { BeatmapBackground } from './BeatmapBackground.ts';
import { HitObjectContainer } from './hitObjects/HitObjectContainer.ts';
import { BeatInfo } from '../beatInfo.ts';
import { EditorClock } from '../clock.ts';
import { PlayfieldOverlay, ToolContainer } from '../tools/ToolContainer.ts';
import { CursorContainer } from './CursorContainer.ts';
import { VolumeControlOverlay } from './VolumeControlOverlay.ts';
import { AudioManager } from '../audio/AudioManager.ts';
import { HitSoundPlayer } from '../audio/HitSoundPlayer.ts';
import { PopoverContainer } from './menu/PopoverContainer.ts';
import { seekInteraction } from '../interaction/Seek.ts';
import { AxisContainer } from '../AxisContainer.ts';
import { EditorContext } from '@/editor/editorContext.ts';
import { isMobile } from '@/util/isMobile.ts';
import { MobileTimelineDrawable } from '@/editor/drawables/timeline/MobileTimelineDrawable.ts';
import { Component } from '@/editor/drawables/Component.ts';
import { Toolbar } from '@/editor/tools/Toolbar.ts';
import { ButtonPanel } from '@/editor/drawables/buttonPanel.ts';
import { FrameStatsOverlayDrawable } from '@/editor/drawables/FrameStatsOverlayDrawable.ts';
import { usePreferencesVisible } from '@/composables/usePreferencesVisible.ts';
import { default as gsap, Power2 } from 'gsap';

export class EditorViewportDrawable extends Drawable {
  @Provide(VIEWPORT_SIZE)
  private readonly canvasSize: ISize;

  readonly playfieldContainer: ScaleToFitContainer;
  readonly playfieldOverlayContainer: ScaleToFitContainer;

  private readonly editor: EditorContext;

  @Provide(PopoverContainer)
  private readonly popoverContainer = new PopoverContainer();

  @Provide(BeatInfo)
  private readonly beatInfo = new BeatInfo();

  @Provide(AxisContainer)
  private readonly axisContainer = new AxisContainer();

  constructor(canvasSize: ISize, editor: EditorContext) {
    super();
    this.editor = editor;
    this.canvasSize = canvasSize;

    this.playfieldContainer = new ScaleToFitContainer(
      { width: 512, height: 384 },
      20,
      false,
    );
    this.playfieldOverlayContainer = new ScaleToFitContainer(
      { width: 512, height: 384 },
      20,
      false,
    );
  }

  @Provide(HitObjectContainer)
  private hitObjectContainer = new HitObjectContainer();
  @Provide(ToolContainer)
  private toolContainer = new ToolContainer();

  private timeline: Component = new MobileTimelineDrawable();
  private toolbar = new Toolbar();
  private buttonPanel?: ButtonPanel;

  onLoad() {
    this.provide(EditorContext, this.editor);
    this.provide(EditorClock, this.editor.clock);
    this.provide(AudioManager, this.editor.audioManager);
    this.provide(PlayfieldOverlay, this.playfieldOverlayContainer);

    useEventListener('keydown', (evt) => {
      if (evt.ctrlKey && evt.key === 's') {
        evt.preventDefault();
      }
    });

    this.addChild(this.popoverContainer);

    const frameStatsOverlay = new FrameStatsOverlayDrawable();

    this.popoverContainer.content.addChild(
      this.beatInfo,
      this.editor.clock,
      new HitSoundPlayer(),
      this.playfieldContainer,
      this.timeline,
      this.toolbar,
      this.playfieldOverlayContainer,
      new VolumeControlOverlay(),
      frameStatsOverlay,
    );

    this.playfieldOverlayContainer.hitArea = null;

    if (isMobile()) {
      this.buttonPanel = this.popoverContainer.content.addChild(
        new ButtonPanel(),
      );
    }

    seekInteraction(
      this.editor.clock,
      this.editor.beatmapManager,
      this.editor.selection,
      this.beatInfo,
      this,
    );

    const playfield = (this.playfield = new Container({
      children: [
        new PlayfieldGrid(),
        this.hitObjectContainer,
        new CursorContainer(),
      ],
      position: new Point(256, 192),
      pivot: new Point(256, 192),
    }));

    this.playfieldContainer.content.addChild(
      new BeatmapBackground(),
      playfield,
      this.toolContainer,
      this.axisContainer,
    );

    const preferencesVisible = usePreferencesVisible();

    let playfieldBounds: Rect | undefined = undefined;

    watchEffect(() => {
      const bounds = new Rect(
        0,
        0,
        this.canvasSize.width,
        this.canvasSize.height,
      );

      this.timeline.setBounds(bounds.splitBottom(85));

      frameStatsOverlay.position.set(
        this.canvasSize.width,
        this.timeline.position.y,
      );

      this.toolbar.setBounds(bounds.splitLeft(50));

      if (preferencesVisible.value) bounds.splitLeft(400);

      if (this.buttonPanel) {
        this.buttonPanel.setBounds(bounds.splitRight(200));
        bounds.splitLeft(200 - this.toolbar.size.x);
      }

      if (!playfieldBounds) {
        playfieldBounds = bounds;
        this.playfieldContainer.setBounds(bounds);
        this.playfieldOverlayContainer.setBounds(playfieldBounds!);
      } else {
        gsap.to(playfieldBounds, {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          duration: 0.3,
          ease: Power2.easeOut,
          onUpdate: () => {
            this.playfieldContainer.setBounds(playfieldBounds!);
            this.playfieldOverlayContainer.setBounds(playfieldBounds!);
          },
        });
      }
    });
  }

  playfield!: Container;
}
