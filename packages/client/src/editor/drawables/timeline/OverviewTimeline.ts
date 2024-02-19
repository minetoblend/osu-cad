import {Component} from "../Component.ts";
import {Graphics} from "pixi.js";
import {Inject} from "../di";
import {ObservablePoint} from "pixi.js/lib/maths/point/ObservablePoint";
import {EditorContext} from "@/editor/editorContext.ts";


export class OverviewTimeline extends Component {

  background = new Graphics();
  timestamps = new Graphics();
  currentTimeIndicator = new Graphics()
    .circle(0, 0, 5)
    .fill(0xffffff);

  private _activeTimeDirty = true;

  private activeTimeOverlay = new Graphics()

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  onLoad() {
    this.addChild(this.background, this.activeTimeOverlay, this.timestamps, this.currentTimeIndicator);
    this.updateTimestamps();
    this.setupEvents();

    this.editor.beatmapManager.beatmap.onBookmarksChanged.addListener(() => {
      this.updateTimestamps();
    });

    const markActiveTimeDirty = () => {
      this._activeTimeDirty = true
    }

    const hitObjects = this.editor.beatmapManager.hitObjects;

    hitObjects.onAdded.addListener(markActiveTimeDirty);
    hitObjects.onRemoved.addListener(markActiveTimeDirty);
    hitObjects.onUpdated.addListener(markActiveTimeDirty);

    this.once('removed', () => {
      hitObjects.onAdded.removeListener(markActiveTimeDirty);
      hitObjects.onRemoved.removeListener(markActiveTimeDirty);
      hitObjects.onUpdated.removeListener(markActiveTimeDirty);
    })
  }


  private setupEvents() {
    this.eventMode = "dynamic";
    this.onpointerdown = (evt) => {
      const position = evt.getLocalPosition(this);
      this.setTimeFromPosition(position.x);

      this.onglobalpointermove = (evt) => {
        const position = evt.getLocalPosition(this);
        this.setTimeFromPosition(position.x);
      };

      addEventListener("pointerup", () => {
        this.onglobalpointermove = null;
      }, {once: true});
    };
  }

  private setTimeFromPosition(position: number) {
    const progress = (position - this.barHeight * 0.5) / (this.size.x - this.barHeight);
    const time = progress * this.editor.clock.songDuration;
    this.editor.clock.seek(time, true);
  }

  private readonly barHeight = 12;

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.background
      .clear()
      .roundRect(0, (this.size.y - this.barHeight) * 0.5, this.size.x, this.barHeight, this.barHeight * 0.5)
      .fill(0x343440);

    if (this.isLoaded) {
      this.updateTimestamps()
      this.updateActiveTime()
    }
  }

  updateTimestamps() {
    const g = this.timestamps;
    g.clear();

    const availableWidth = this.size.x - this.barHeight;
    this.editor.beatmapManager.beatmap.bookmarks.forEach((bookmkark) => {
      const progress = bookmkark.time / this.editor.clock.songDuration;
      const x = this.barHeight * 0.5 + progress * availableWidth;
      g.roundRect(x - 1, (this.size.y - this.barHeight) * 0.5, 2, this.barHeight, 1)
        .fill(0x4c53d9);
    });
  }

  onTick() {
    const songDuration = this.editor.clock.songDuration;
    const availableWidth = this.size.x - this.barHeight;

    const progress = this.editor.clock.currentTimeAnimated / songDuration;

    this.currentTimeIndicator.position.set(this.barHeight * 0.5 + progress * availableWidth, this.size.y * 0.5);

    if (this._activeTimeDirty) {
      this.updateActiveTime()
      this._activeTimeDirty = false
    }
  }

  updateActiveTime() {
    this.activeTimeOverlay.clear()

    const hitObjects = this.editor.beatmapManager.hitObjects.hitObjects
    if (hitObjects.length === 0) return

    let segmentStart = hitObjects[0].startTime
    let lastObjectEnd = hitObjects[0].endTime
    const threshold = 1000

    for (let i = 1; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i]
      if (hitObject.startTime - lastObjectEnd > threshold || i === hitObjects.length - 1) {
        let start = segmentStart
        let end = lastObjectEnd
        if (end - start < threshold) {
          let center = (start + end) * 0.5
          start = center - threshold * 0.5
          end = center + threshold * 0.5
        }

        this.activeTimeOverlay
          .roundRect(
            this.barHeight * 0.5 + start / this.editor.clock.songDuration * (this.size.x - this.barHeight),
            (this.size.y - this.barHeight) * 0.5,
            (end - start) / this.editor.clock.songDuration * (this.size.x - this.barHeight),
            this.barHeight,
            this.barHeight * 0.5
          )
          .fill({
            color: 0xffffff,
            alpha: 0.3
          })
        segmentStart = hitObject.startTime
      }
      lastObjectEnd = hitObject.endTime
    }

  }

}