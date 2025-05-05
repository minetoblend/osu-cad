import { DependencyContainer } from "../../di/DependencyContainer";
import { Container } from "../../graphics/containers/Container";
import { Anchor } from "../../graphics/drawables/Anchor";
import { loadDrawable } from "../../graphics/drawables/Drawable";
import { FramedClock } from "../../timing/FramedClock";

describe("drawable anchor & origin", () =>
{
  it("correctly applies anchor", () =>
  {
    let child: Container;
    let child2: Container;
    let child3: Container;
    let child4: Container;

    const parent = Container.create({
      width: 100,
      height: 100,
      children: [
        (child = Container.create({
          width: 50,
          height: 50,
          anchor: Anchor.TopLeft,
        })),
        (child2 = Container.create({
          width: 50,
          height: 50,
          anchor: Anchor.TopRight,
        })),
        (child3 = Container.create({
          width: 50,
          height: 50,
          anchor: Anchor.BottomLeft,
        })),
        (child4 = Container.create({
          width: 50,
          height: 50,
          anchor: Anchor.Center,
        })),
      ],
    });

    loadDrawable(parent, new FramedClock(), new DependencyContainer());

    expect(child.anchorPosition).toEqual({ x: 0, y: 0 });
    expect(child2.anchorPosition).toEqual({ x: 100, y: 0 });
    expect(child3.anchorPosition).toEqual({ x: 0, y: 100 });
    expect(child4.anchorPosition).toEqual({ x: 50, y: 50 });

    parent.width = 200;

    expect(child.anchorPosition).toEqual({ x: 0, y: 0 });
    expect(child2.anchorPosition).toEqual({ x: 200, y: 0 });
    expect(child3.anchorPosition).toEqual({ x: 0, y: 100 });
    expect(child4.anchorPosition).toEqual({ x: 100, y: 50 });

    child.anchor = Anchor.BottomRight;

    expect(child.anchorPosition).toEqual({ x: 200, y: 100 });
  });

  it("correctly applies origin", () =>
  {
    let child: Container;
    let child2: Container;
    let child3: Container;
    let child4: Container;

    const parent = Container.create({
      width: 100,
      height: 100,
      children: [
        (child = Container.create({
          width: 50,
          height: 50,
          origin: Anchor.TopLeft,
        })),
        (child2 = Container.create({
          width: 50,
          height: 50,
          origin: Anchor.TopRight,
        })),
        (child3 = Container.create({
          width: 50,
          height: 50,
          origin: Anchor.BottomLeft,
        })),
        (child4 = Container.create({
          width: 50,
          height: 50,
          origin: Anchor.Center,
        })),
      ],
    });

    loadDrawable(parent, new FramedClock(), new DependencyContainer());

    expect(child.originPosition).toEqual({ x: 0, y: 0 });
    expect(child2.originPosition).toEqual({ x: 50, y: 0 });
    expect(child3.originPosition).toEqual({ x: 0, y: 50 });
    expect(child4.originPosition).toEqual({ x: 25, y: 25 });

    parent.width = 200;

    expect(child.originPosition).toEqual({ x: 0, y: 0 });
    expect(child2.originPosition).toEqual({ x: 50, y: 0 });
    expect(child3.originPosition).toEqual({ x: 0, y: 50 });
    expect(child4.originPosition).toEqual({ x: 25, y: 25 });

    child.origin = Anchor.BottomRight;

    expect(child.originPosition).toEqual({ x: 50, y: 50 });
  });
});
