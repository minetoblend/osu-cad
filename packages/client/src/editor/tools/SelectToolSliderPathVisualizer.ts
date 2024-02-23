import {
  SliderPathHandle,
  SliderPathVisualizer,
} from './SliderPathVisualizer.ts';
import { PathType, updateHitObject, Vec2 } from '@osucad/common';
import { snapSliderLength } from './snapSliderLength.ts';
import { Inject } from '../drawables/di';
import { BeatInfo } from '../beatInfo.ts';
import { SelectTool } from '@/editor/tools/SelectTool.ts';
import { LongPressInteraction } from '@/editor/tools/interactions/LongPressInteraction.ts';

export class SelectToolSliderPathVisualizer extends SliderPathVisualizer {
  @Inject(BeatInfo)
  private beatInfo!: BeatInfo;

  constructor(readonly tool: SelectTool) {
    super();
  }

  lastTap = 0;

  installHandleListeners(handle: SliderPathHandle, index: number) {
    handle.onpointerdown = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const isDoubleTap =
        e.pointerType === 'touch' && performance.now() - this.lastTap < 300;
      if (e.pointerType === 'touch') this.lastTap = performance.now();

      if ((e.button === 0 && e.ctrlKey) || isDoubleTap) {
        let type = this.slider!.path.controlPoints[index].type;
        switch (type) {
          case null:
            type = PathType.Bezier;
            break;
          case PathType.Bezier:
            type = PathType.Linear;
            break;
          case PathType.Linear:
            type = PathType.PerfectCurve;
            break;
          case PathType.PerfectCurve:
            type = index === 0 ? PathType.Bezier : null;
            break;
        }
        const controlPoints = [...this.slider!.path.controlPoints];
        controlPoints[index] = { ...controlPoints[index], type };
        this.editor.commandManager.submit(
          updateHitObject(this.slider!, {
            path: controlPoints,
          }),
          true,
        );
      } else if (e.button === 0) {
        const drag = () => {
          handle.onglobalpointermove = (e) => {
            const pos = e.getLocalPosition(this.parent);
            const controlPoints = this.slider!.path.controlPoints.map((it) => ({
              ...it,
            }));

            if (index > 0) {
              controlPoints[index].x = pos.x - this.slider!.stackedPosition.x;
              controlPoints[index].y = pos.y - this.slider!.stackedPosition.y;
              this.editor.commandManager.submit(
                updateHitObject(this.slider!, {
                  path: controlPoints,
                }),
              );
            } else {
              const delta = Vec2.sub(this.slider!.stackedPosition, pos);
              for (let i = 1; i < controlPoints.length; i++) {
                controlPoints[i].x += delta.x;
                controlPoints[i].y += delta.y;
              }
              this.editor.commandManager.submit(
                updateHitObject(this.slider!, {
                  path: controlPoints,
                  position: pos,
                }),
              );
            }
            snapSliderLength(this.slider!, this.editor, this.beatInfo);
          };

          addEventListener(
            'pointerup',
            () => {
              handle.onglobalpointermove = null;
              this.editor.commandManager.commit();
            },
            { once: true },
          );
        };

        if (e.pointerType === 'touch') {
          this.tool.mousePos = Vec2.from(e.getLocalPosition(this.parent));
          this.tool.beginInteraction(LongPressInteraction, {
            action: () => {
              this.deleteControlPoint(index);
            },
            onMoveCancel: () => {
              drag();
            },
          });
          return;
        } else {
          drag();
        }
      }
    };

    handle.onrightdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteControlPoint(index);
    };
  }

  deleteControlPoint(index: number) {
    if (this.slider!.path.controlPoints.length <= 2) return;
    const controlPoints = [...this.slider!.path.controlPoints];
    if (index > 0) {
      controlPoints.splice(index, 1);
      this.editor.commandManager.submit(
        updateHitObject(this.slider!, {
          path: controlPoints,
        }),
      );
    } else {
      const type = controlPoints[0].type;
      const position = Vec2.from(this.slider!.path.controlPoints[1]);
      for (let i = 1; i < controlPoints.length; i++) {
        controlPoints[i] = {
          ...controlPoints[i],
          x: controlPoints[i].x - position.x,
          y: controlPoints[i].y - position.y,
        };
      }
      controlPoints.splice(0, 1);
      if (controlPoints[0].type === null) controlPoints[0].type = type;
      this.editor.commandManager.submit(
        updateHitObject(this.slider!, {
          path: controlPoints,
          position: Vec2.add(this.slider!.position, position),
        }),
      );
      this.editor.commandManager.commit();
    }
  }
}
