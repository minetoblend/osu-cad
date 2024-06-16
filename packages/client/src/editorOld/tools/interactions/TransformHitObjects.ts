import { EditorContext } from '@/editorOld/editorContext.ts';
import { Slider, updateHitObject, Vec2 } from '@osucad/common';
import { Container, Matrix } from 'pixi.js';
import { snapSliderLength } from '@/editorOld/tools/snapSliderLength.ts';
import { BeatInfo } from '@/editorOld/beatInfo.ts';

export function transformHitObjects(
  editor: EditorContext,
  container: Container,
  beatInfo: BeatInfo,
) {
  const canvas = document.querySelector('canvas')! as HTMLCanvasElement;

  let p1: Vec2 | null = null;
  let p2: Vec2 | null = null;

  const onMove = (evt: TouchEvent) => {
    if (evt.touches.length !== 2) return;
    evt.preventDefault();

    const t1 = Vec2.from(
      container.toLocal({
        x: evt.touches[0].clientX - canvas.clientLeft,
        y: evt.touches[0].clientY - canvas.clientTop,
      }),
    );

    const t2 = Vec2.from(
      container.toLocal({
        x: evt.touches[1].clientX - canvas.clientLeft,
        y: evt.touches[1].clientY - canvas.clientTop,
      }),
    );

    if (p1 === null || p2 === null) {
      p1 = t1;
      p2 = t2;
      return;
    }

    const angle =
      Math.atan2(t2.y - t1.y, t2.x - t1.x) -
      Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const scale = t2.distanceTo(t1) / p2.distanceTo(p1);

    const pcenter = p1.add(p2).scale(0.5);
    const tcenter = t1.add(t2).scale(0.5);

    const transform = new Matrix()
      .translate(-pcenter.x, -pcenter.y)
      .rotate(angle)
      .scale(scale, scale)
      .translate(tcenter.x, tcenter.y);

    p1 = t1;
    p2 = t2;

    for (const hitObject of editor.selection.selectedObjects) {
      const position = hitObject.position;
      const newPosition = Vec2.from(transform.apply(position));

      if (hitObject instanceof Slider) {
        const pointTransform = transform
          .clone()
          .translate(-transform.tx, -transform.ty);

        const path = hitObject.path.controlPoints.map((p) => {
          return {
            ...Vec2.from(pointTransform.apply(p)),
            type: p.type,
          };
        });

        editor.commandManager.submit(
          updateHitObject(hitObject, {
            position: newPosition,
            path,
          }),
        );

        snapSliderLength(hitObject, editor, beatInfo);
      }

      editor.commandManager.submit(
        updateHitObject(hitObject, {
          position: newPosition,
        }),
      );
    }
  };

  canvas.addEventListener('touchmove', onMove, { passive: false });

  addEventListener('touchend', () => {
    canvas.removeEventListener('touchmove', onMove);
    editor.commandManager.commit();
  });
}
