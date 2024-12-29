import { DependencyContainer } from '../../di/DependencyContainer';
import { Container } from '../../graphics/containers/Container';
import { Axes } from '../../graphics/drawables/Axes';
import { loadDrawable } from '../../graphics/drawables/Drawable';
import { FramedClock } from '../../timing/FramedClock';

describe('drawable layout', () => {
  it('relatively sizes itself', () => {
    let child1: Container;
    let child2: Container;
    let child3: Container;
    let child4: Container;

    const parent = Container.create({
      width: 100,
      height: 100,
      label: 'parent',
      children: [
        (child1 = Container.create({
          width: 50,
          height: 50,
          label: 'child1',
        })),
        (child2 = Container.create({
          relativeSizeAxes: Axes.X,
          width: 0.25,
          height: 50,
          label: 'child2',
        })),
        (child3 = Container.create({
          relativeSizeAxes: Axes.Y,
          width: 50,
          height: 0.5,
          label: 'child3',
        })),
        (child4 = Container.create({
          relativeSizeAxes: Axes.Both,
          width: 0.75,
          height: 1,
          label: 'child4',
        })),
      ],
    });

    loadDrawable(parent, new FramedClock(), new DependencyContainer());

    expect(child1.drawSize).toEqual({ x: 50, y: 50 });
    expect(child2.drawSize).toEqual({ x: 25, y: 50 });
    expect(child3.drawSize).toEqual({ x: 50, y: 50 });
    expect(child4.drawSize).toEqual({ x: 75, y: 100 });

    parent.width = 200;

    expect(child1.drawSize).toEqual({ x: 50, y: 50 });
    expect(child2.drawSize).toEqual({ x: 50, y: 50 });
    expect(child3.drawSize).toEqual({ x: 50, y: 50 });
    expect(child4.drawSize).toEqual({ x: 150, y: 100 });
  });

  it('relatively sizes itself with a parent that has a relative size', () => {
    let a: Container;
    let b: Container;
    let c: Container;

    // eslint-disable-next-line prefer-const
    a = Container.create({
      width: 100,
      height: 100,
      label: 'a',
      children: [
        (b = Container.create({
          relativeSizeAxes: Axes.X,
          width: 0.5,
          height: 100,
          label: 'b',
          children: [
            (c = Container.create({
              relativeSizeAxes: Axes.X,
              width: 0.5,
              height: 100,
              label: 'c',
            })),
          ],
        })),
      ],
    });

    loadDrawable(a, new FramedClock(), new DependencyContainer());

    expect(a.drawSize).toEqual({ x: 100, y: 100 });
    expect(b.drawSize).toEqual({ x: 50, y: 100 });
    expect(c.drawSize).toEqual({ x: 25, y: 100 });

    a.width = 200;

    expect(a.drawSize).toEqual({ x: 200, y: 100 });
    expect(b.drawSize).toEqual({ x: 100, y: 100 });
    expect(c.drawSize).toEqual({ x: 50, y: 100 });

    b.width = 1;

    expect(a.drawSize).toEqual({ x: 200, y: 100 });
    expect(b.drawSize).toEqual({ x: 200, y: 100 });
    expect(c.drawSize).toEqual({ x: 100, y: 100 });
  });

  it('relatively positions itself', () => {
    let child1: Container;
    let child2: Container;
    let child3: Container;
    let child4: Container;

    const parent = Container.create({
      width: 100,
      height: 100,
      label: 'parent',
      children: [
        (child1 = Container.create({
          x: 50,
          y: 50,
          label: 'child1',
        })),
        (child2 = Container.create({
          relativePositionAxes: Axes.X,
          x: 0.25,
          y: 50,
          label: 'child2',
        })),
        (child3 = Container.create({
          relativePositionAxes: Axes.Y,
          x: 50,
          y: 0.5,
          label: 'child3',
        })),
        (child4 = Container.create({
          relativePositionAxes: Axes.Both,
          x: 0.75,
          y: 1,
          label: 'child4',
        })),
      ],
    });

    loadDrawable(parent, new FramedClock(), new DependencyContainer());

    expect(child1.drawPosition).toEqual({ x: 50, y: 50 });
    expect(child2.drawPosition).toEqual({ x: 25, y: 50 });
    expect(child3.drawPosition).toEqual({ x: 50, y: 50 });
    expect(child4.drawPosition).toEqual({ x: 75, y: 100 });

    parent.width = 200;

    expect(child1.drawPosition).toEqual({ x: 50, y: 50 });
    expect(child2.drawPosition).toEqual({ x: 50, y: 50 });
    expect(child3.drawPosition).toEqual({ x: 50, y: 50 });
    expect(child4.drawPosition).toEqual({ x: 150, y: 100 });
  });

  it('automatically updates draw node transform on invalidation', () => {
    const drawable = Container.create({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });

    loadDrawable(drawable, new FramedClock(), new DependencyContainer());

    drawable.updateSubTree();
    drawable.updateSubTreeTransforms();

    expect(drawable.drawNodePosition).toEqual({ x: 50, y: 50 });

    drawable.x = 100;
    drawable.updateSubTree();
    drawable.updateSubTreeTransforms();

    expect(drawable.drawNodePosition).toEqual({ x: 100, y: 50 });
  });
});
