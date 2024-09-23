import { Action } from '../bindables';
import { Axes, CompositeDrawable, type Drawable, LoadState } from '../graphics';
import { type IScreen, isScreen } from './IScreen.ts';
import { ScreenExitEvent } from './ScreenExitEvent.ts';
import { ScreenTransitionEvent } from './ScreenTransitionEvent.ts';

export class ScreenStack extends CompositeDrawable {
  readonly screenPushed = new Action<{
    lastScreen: IScreen | null;
    newScreen: IScreen;
  }>();

  readonly screenExited = new Action<{
    lastScreen: IScreen;
    newScreen: IScreen | null;
  }>();

  constructor(baseScreen?: IScreen, suspendImmediately: boolean = false) {
    super();
    this.relativeSizeAxes = Axes.Both;

    this.#suspendImmediately = suspendImmediately;

    if (baseScreen) {
      this.push(baseScreen);
    }

    this.screenExited.addListener(({ lastScreen, newScreen }) => this.#onExited(lastScreen, newScreen));
  }

  get currentScreen(): IScreen | null {
    return this.#stack[this.#stack.length - 1] ?? null;
  }

  readonly #stack: IScreen[] = [];

  readonly #exited: Drawable[] = [];

  readonly #suspendImmediately: boolean;

  push(screen: IScreen) {
    this.#push(this.currentScreen, screen);
  }

  #push(source: IScreen | null, newScreen: IScreen) {
    if (this.#stack.includes(newScreen)) {
      throw new Error('Screen already entered');
    }

    if (!source && this.#stack.length > 0) {
      throw new Error('A source must be provided when pushing to a non-empty ScreenStack');
    }

    if (newScreen.removeWhenNotAlive) {
      throw new Error(`Screen will be removed on push: ${newScreen.name}`);
    }

    if (source !== null && source !== this.currentScreen) {
      throw new Error('Screen is not current screen');
    }

    if (newScreen.isLoaded) {
      throw new Error('A screen should not be loaded before being pushed.');
    }

    if (this.#suspendImmediately) {
      this.#suspend(source, newScreen);
    }

    this.#stack.push(newScreen);
    this.screenPushed.emit({ lastScreen: source, newScreen });

    newScreen.onLoadComplete.addListener(() => {
      newScreen.onEntering(new ScreenTransitionEvent(source, newScreen));
    });

    if (source === null) {
      if (this.loadState >= LoadState.Ready) {
        this.loadScreen(this, newScreen).then(() => this.#finishPush(null, newScreen));
      }
      else {
        this.schedule(() => this.#finishPush(null, newScreen));
      }
    }
    else {
      this.loadScreen(source as unknown as CompositeDrawable, newScreen).then(() =>
        this.#finishPush(source, newScreen),
      );
    }
  }

  #finishPush(parent: IScreen | null, child: IScreen) {
    if (!child.validForPush) {
      if (child === this.currentScreen) {
        this.#exitFrom(null, {
          shouldFireExitEvent: false,
          shouldFireResumeEvent: this.#suspendImmediately,
        });
        return;
      }
    }

    if (!this.#suspendImmediately) {
      this.#suspend(parent, child);
    }

    this.addInternal(child);
  }

  #suspend(from: IScreen | null, to: IScreen) {
    if (from === null)
      return;

    if (from.isLoaded) {
      performSuspend();
    }
    else {
      from.onLoadComplete.addListener(() => performSuspend());
    }

    function performSuspend() {
      from!.onSuspending(new ScreenTransitionEvent(from, to));
      from?.expire();
    }
  }

  protected loadScreen(loader: CompositeDrawable | null, toLoad: IScreen): Promise<void> {
    return new Promise((resolve) => {
      if (loader && (loader as unknown as IScreen)?.validForPush === false)
        return;

      if (toLoad.loadState >= LoadState.Ready) {
        resolve();
      }
      else {
        if (loader && loader?.loadState >= LoadState.Ready) {
          loader.loadComponentAsync(toLoad, undefined, this.scheduler).then(() => resolve());
        }
        else {
          this.schedule(() => this.loadScreen(loader, toLoad).then(resolve));
        }
      }
    });
  }

  exit(source: IScreen) {
    if (!this.#stack.includes(source as IScreen)) {
      throw new Error('Not current screen');
    }

    if (this.currentScreen !== source) {
      throw new Error('Screen is not current, use Screen.MakeCurrent instead.');
    }

    this.#exitFrom(null);
  }

  makeCurrent(target: IScreen) {
    if (this.currentScreen === target)
      return;

    if (!this.#stack.includes(target))
      throw new Error(`Screen not in stack: ${target.name}`);

    // while a parent still exists and exiting is not blocked, continue to iterate upwards.
    let exitCandidate: IScreen | null = null;

    while (this.currentScreen !== null) {
      // the exit source is always the candidate from the previous loop, or null if this is the current screen.
      const exitSource: IScreen | null = exitCandidate;
      exitCandidate = this.currentScreen;

      const exitBlocked = this.#exitFrom(exitSource, { shouldFireResumeEvent: false, destination: target });

      if (exitBlocked) {
        // exit was blocked and no screen change has happened in this loop.
        // no resume event should be fired.
        if (exitSource === null)
          return;

        // exit was blocked, but a nested exit operation may have succeeded (ie. a screen calling this.Exit() after blocking).
        // in such a case, the MakeCurrent / resumeFrom flow would have already been performed.
        // to avoid a duplicate resumeFrom event, only fire from here if it can be assured that the current screen is still the one which blocked the exit above.
        if (this.currentScreen === exitCandidate)
          this.#resumeFrom(exitSource);

        return;
      }

      if (this.currentScreen === target) {
        // an exit was successful; resume from the "proposed" target (which was exited above).
        this.#resumeFrom(exitCandidate);
        return;
      }
    }
  }

  isCurrentScreen(screen: IScreen) {
    return this.currentScreen === screen;
  }

  getParentScreen(screen: IScreen) {
    const index = this.#stack.indexOf(screen);
    if (index === -1)
      return null;
    return this.#stack[index - 1] ?? null;
  }

  getChildScreen(screen: IScreen) {
    const index = this.#stack.indexOf(screen);
    if (index === -1)
      return null;
    return this.#stack[index + 1] ?? null;
  }

  #exitFrom(
    source: IScreen | null,
    {
      shouldFireExitEvent = true,
      shouldFireResumeEvent = true,
      destination = null,
    }: { shouldFireExitEvent?: boolean; shouldFireResumeEvent?: boolean; destination?: IScreen | null } = {},
  ): boolean {
    if (this.#stack.length === 0) {
      return false;
    }

    const toExit = this.#stack.pop()!;

    if (shouldFireExitEvent && toExit.isLoaded) {
      const next = this.currentScreen;

      // Add the screen back on the stack to allow pushing screens in OnExiting.
      this.#stack.push(toExit);

      // if a screen is !ValidForResume, it should not be allowed to block unless it is the current screen (source === null)
      // OnExiting should still be called regardless.
      const blockRequested = toExit.onExiting(new ScreenExitEvent(toExit, next, destination ?? next));

      if ((source === null || toExit.validForResume) && blockRequested)
        return true;

      if (toExit !== this.#stack.pop())
        throw new Error('Cannot push to ScreenStack during exit without blocking the exit.');
    }

    toExit.validForResume = false;
    toExit.validForPush = false;

    if (source === null) {
      // This is the first screen that exited
      toExit.expire();
    }

    this.#exited.push(toExit);

    this.screenExited.emit({
      lastScreen: toExit,
      newScreen: this.currentScreen,
    });

    // Resume the next current screen from the exited one
    if (shouldFireResumeEvent)
      this.#resumeFrom(toExit);

    return false;
  }

  #onExited(prev: IScreen, next: IScreen | null) {
    // (prev as CompositeDrawable)?.UnbindAllBindablesSubTree()
  }

  #resumeFrom(source: IScreen) {
    if (this.currentScreen === null)
      return;

    if (this.currentScreen.validForResume) {
      this.currentScreen.onResuming(new ScreenTransitionEvent(source, this.currentScreen));

      // Screens are expired when they are suspended - lifetime needs to be reset when resumed
      this.currentScreen.lifetimeEnd = Infinity;
    }
    else {
      this.#exitFrom(source);
    }
  }

  // protected override bool ShouldBeConsideredForInput(Drawable child) => base.ShouldBeConsideredForInput(child) && (!(child is IScreen screen) || screen.IsCurrentScreen());

  protected override shouldBeConsideredForInput(child: Drawable): boolean {
    return super.shouldBeConsideredForInput(child) && (!isScreen(child) || (child as IScreen).validForResume);
  }

  override updateChildrenLife(): boolean {
    if (!super.updateChildrenLife())
      return false;

    // In order to provide custom suspend/resume logic, screens always have RemoveWhenNotAlive set to false.
    // We need to manually handle removal here (in the opposite order to how the screens were pushed to ensure bindable sanity).
    if (this.#exited[0]?.isAlive === false) {
      for (const s of this.#exited) {
        this.removeInternal(s, true);
      }

      this.#exited.length = 0;
    }

    return true;
  }

  override dispose(isDisposing: boolean = true) {
    for (const s of this.#exited) {
      s.dispose();
    }

    this.#exited.length = 0;

    for (const s of this.#stack) {
      s.dispose();
    }

    this.#stack.length = 0;

    super.dispose(isDisposing);
  }
}
