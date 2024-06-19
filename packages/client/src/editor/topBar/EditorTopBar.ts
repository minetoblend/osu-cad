import { BackdropBlurFilter } from 'pixi-filters';
import { dependencyLoader } from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { Corner } from '../../framework/drawable/Corner';
import { MarginPadding } from '../../framework/drawable/MarginPadding';
import { EditorCornerPiece } from './EditorCornerPiece';
import { RhythmTimeline } from './RhythmTimeline';
import { Box } from '@/framework/drawable/Box.ts';
import { RhythmTimelineZoomButtons } from '@/editor/topBar/RhythmTimelineZoomButtons.ts';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { EditorMenuBar } from './EditorMenuBar';
import { DropdownSelect } from '../components/DropdownSelect';

export class EditorTopBar extends ContainerDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 84;
  }

  @dependencyLoader()
  load() {
    const filter = new BackdropBlurFilter({
      strength: 10,
      padding: 32,
      quality: 3,
      resolution: devicePixelRatio,
      antialias: 'on',
    });
    filter.padding = 32;

    const rhythmTimeline = new RhythmTimeline({
      relativeSizeAxes: Axes.Both,
    });

    this.add(
      new ContainerDrawable({
        relativeSizeAxes: Axes.X,
        height: 66,
        margin: new MarginPadding({ horizontal: 190 }),
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
            alpha: 0.5,
          }),
          rhythmTimeline,
        ],
      }),
    );

    const leftPiece = this.add(
      new EditorCornerPiece(Corner.TopLeft, {
        width: 220,
        relativeSizeAxes: Axes.Y,
        children: [
          new RhythmTimelineZoomButtons(rhythmTimeline, {
            relativeSizeAxes: Axes.Y,
            width: 30,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            margin: new MarginPadding({
              horizontal: 6,
              vertical: 4,
            }),
          }),
          new EditorMenuBar(),
          new DropdownSelect({
            y: 30,
            relativeSizeAxes: Axes.X,
            height: 23,
            margin: new MarginPadding({
              left: 8,
              right: 60
            })
          })
        ],
      }),
    );

    const rightPiece = this.add(
      new EditorCornerPiece(Corner.TopRight, {
        width: 220,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      children: [],
      }),
    );

    leftPiece.drawNode.filters = [filter];
    rightPiece.drawNode.filters = [filter];
  }
}
