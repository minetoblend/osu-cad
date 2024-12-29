import type { Container, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Fit, ScalingContainer } from '@osucad/editor/editor/ScalingContainer';
import { NotificationOverlay } from '@osucad/editor/notifications/NotificationOverlay';
import { Axes, Box, DependencyContainer, Game } from 'osucad-framework';
import { UIFonts } from './drawables/UIFonts';
import { OsucadIcons } from './OsucadIcons';
import { ContextMenuContainer } from './userInterface/ContextMenuContainer';

export class OsucadGameBase extends Game {
  protected override async load(dependencies: ReadonlyDependencyContainer): Promise<void> {
    super.load(dependencies);

    super.content.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        depth: 1,
      }),
      new ScalingContainer({
        desiredSize: {
          x: 960,
          y: 768,
        },
        fit: Fit.Fill,
        child: this.#content = new ContextMenuContainer({}),
      }),
    );

    this.addParallelLoad(OsucadIcons.load());
    this.addParallelLoad(UIFonts.load());
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  #content!: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    await Promise.all(this.#parallelLoadPromises);

    const notificationOverlay = new NotificationOverlay();
    this.add(notificationOverlay);
    this.#dependencies.provide(NotificationOverlay, notificationOverlay);
  }

  readonly #parallelLoadPromises: Promise<any>[] = [];

  protected addParallelLoad(fnOrPromise: Promise<any> | (() => Promise<any>)) {
    this.#parallelLoadPromises.push(
      typeof fnOrPromise === 'function'
        ? fnOrPromise()
        : fnOrPromise,
    );
  }
}
