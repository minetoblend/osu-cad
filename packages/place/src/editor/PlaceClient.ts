import type { Beatmap } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BoxedBeatmap, SimpleFile, StaticFileStore } from '@osucad/core';
import { Bindable, BindableBoolean, Component } from '@osucad/framework';
import { PlaceBeatmap } from './PlaceBeatmap';

export class PlaceClient extends Component {
  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await Promise.all([
      this.loadBeatmap(),
      this.loadPlacementState(),
      this.loadUser(),
      this.initEventSource(),
      super.loadAsync(dependencies),
    ]);
  }

  protected loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.loadPlacementState(), 10_000, true);
  }

  update() {
    super.update();

    this.canPlace.value = !!this.countdownEndTime.value && this.time.current > this.countdownEndTime.value.endTime;
  }

  async loadBeatmap() {
    const { summary } = await fetch('/api/beatmap').then(res => res.json());

    const beatmap = new BoxedBeatmap();
    beatmap.initializeFromSummary(summary);

    const assets = beatmap.assets!.map(it => new SimpleFile(
      it.path,
      () => fetch(`/api/beatmap/assets/${it.id}`).then(it => it.arrayBuffer()),
    ));

    this.beatmap = new PlaceBeatmap(
      beatmap.beatmap as Beatmap,
      new StaticFileStore(assets),
      this,
    );
  }

  async loadPlacementState() {
    const res = await fetch('/api/place/countdown').then(res => res.ok ? res.json() : null);

    if (res) {
      const { timeRemaining, totalCountdown } = res;

      const endTime = this.time.current + timeRemaining;

      if (this.countdownEndTime.value && Math.abs(this.countdownEndTime.value.endTime - endTime) < 2000) {
        return;
      }

      this.countdownEndTime.value = {
        endTime,
        totalTime: totalCountdown,
      };
    }
    else {
      this.countdownEndTime.value = null;
    }
  }

  async initEventSource() {
    const eventSource = new EventSource('/api/place/events');
    eventSource.addEventListener('place', e => this.onObjectPlaced(JSON.parse(e.data)));

    eventSource.onmessage = console.log;
    eventSource.onerror = console.error;
    eventSource.onopen = console.log;
  }

  async loadUser() {
    this.user.value = await fetch('/api/users/me').then(res => res.ok ? res.json() : null);
  }

  get isLoggedIn() {
    return !!this.user.value;
  }

  readonly user = new Bindable<{ id: number; username: string } | null>(null);

  readonly countdownEndTime = new Bindable<{
    endTime: number;
    totalTime: number;
  } | null>(null);

  readonly canPlace = new BindableBoolean();

  beatmap!: PlaceBeatmap;

  login() {
    window.open('/api/auth/osu/login', '_self');
  }

  onObjectPlaced(evt: { user: number }) {
    console.log(evt, this.user.value?.id);
    if (evt.user === this.user.value?.id)
      this.loadPlacementState();
  }
}
