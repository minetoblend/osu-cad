import {Component} from "../Component.ts";
import {BitmapText, Container, Graphics} from "pixi.js";
import {Inject} from "../di";
import {ObservablePoint} from "pixi.js/lib/maths/point/ObservablePoint";
import {EditorContext} from "@/editor/editorContext.ts";
import {Drawable} from "@/editor/drawables/Drawable.ts";
import {UserActivity, UserSessionInfo} from "@osucad/common";
import {animate} from "@/editor/drawables/animate.ts";


export class OverviewTimeline extends Component {

  background = new Graphics();
  timestamps = new Graphics();
  currentTimeIndicator = new Graphics()
    .circle(0, 0, 5)
    .fill(0xffffff);
  userContainer = new Container();

  private _activeTimeDirty = true;

  private activeTimeOverlay = new Graphics()

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  onLoad() {
    this.addChild(this.background, this.activeTimeOverlay, this.userContainer, this.timestamps, this.currentTimeIndicator);
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

    const onUserJoined = (user: UserSessionInfo) => {
      if (user.sessionId === this.editor.connectedUsers.ownUser.value?.sessionId) return
      this.userContainer.addChild(new UserTimeIndicator(user))

    }
    this.editor.socket.on("userJoined", onUserJoined)
    this.editor.connectedUsers.users.value.forEach(onUserJoined)

    this.once('destroyed', () => {
      hitObjects.onAdded.removeListener(markActiveTimeDirty);
      hitObjects.onRemoved.removeListener(markActiveTimeDirty);
      hitObjects.onUpdated.removeListener(markActiveTimeDirty);

      this.editor.socket.off("userJoined", onUserJoined)
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

  readonly barHeight = 12;

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
    this.userContainer.y = this.size.y * 0.5
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

class UserTimeIndicator extends Drawable {
  content = new Graphics()
    .roundRect(
      -3, -5,
      6, 10,
      3
    )
    //.circle(0, 0, 5)
    .fill(0x52cca3)

  constructor(
    readonly user: UserSessionInfo
  ) {
    super();
    this.addChild(this.content);
    this.visible = false
  }

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  private _userText?: BitmapText

  onLoad() {
    this.eventMode = 'static'

    const onUserActivity = (sessionId: number, activity: UserActivity) => {
      if (sessionId === this.user.sessionId) {
        if (activity.type === 'composeScreen') {
          this.visible = true
          const parent = this.parent?.parent as OverviewTimeline
          this.position.x =
            parent.barHeight * 0.5 + activity.currentTime / this.editor.clock.songDuration * (parent.size.x - parent.barHeight)
        } else {
          this.visible = false
        }
      }
    }

    const onUserLeft = (user: UserSessionInfo) => {
      if (user.sessionId === this.user.sessionId) {
        this.destroy()
      }
    }

    this.editor.socket.on("userActivity", onUserActivity)
    this.editor.socket.on("userLeft", onUserLeft)

    this.once('destroyed', () => {
      this.editor.socket.off("userActivity", onUserActivity)
      this.editor.socket.off("userLeft", onUserLeft)
    })

    this.onglobalpointermove = (evt) => {
      const pos = evt.getLocalPosition(this)
      const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y)

      if (distance < 20) {
        this.text.visible = true
        this.text.alpha = animate(distance, 20, 10, 0, 1)
      } else {
        this.text.visible = false
      }
    }
  }


  get text() {
    this._userText ??= this.addChild(
      new BitmapText({
        text: this.user.username,
        style: {
          fontFamily: "Nunito Sans",
          fontSize: 15,
          fill: 0xffffff,
        },
        anchor: {x: 0, y: 1},
        x: 5,
        y: -5,
        resolution: devicePixelRatio
      })
    )
    return this._userText;
  }


}