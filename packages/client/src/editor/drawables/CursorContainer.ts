import { Assets, BitmapText, Point, Sprite } from 'pixi.js';
import { UserActivity, UserId, UserSessionInfo, Vec2 } from '@osucad/common';
import { Drawable } from './Drawable.ts';
import { Inject } from './di';
import gsap from 'gsap';
import { animate } from './animate.ts';
import { EditorContext } from '@/editor/editorContext.ts';

export class CursorContainer extends Drawable {
  @Inject(EditorContext)
  editor!: EditorContext;

  lastUpdate = performance.now();
  readonly updateInterval = 50;

  mousePos = new Vec2();
  mouseDown = false;

  onLoad() {
    this.editor.socket.on('userJoined', (user) => {
      this.addUserCursor(user);
    });
    this.editor.socket.on('userLeft', (user) => {
      this.removeUserCursor(user.id);
    });
    this.editor.connectedUsers.users.value.forEach((user) => {
      this.addUserCursor(user);
    });

    this.eventMode = 'static';

    this.on('globalpointermove', (evt) => {
      this.mousePos = evt.getLocalPosition(this);
    });
  }

  onTick() {
    const now = performance.now();
    if (now - this.lastUpdate > this.updateInterval) {
      this.editor.socket.emit('setPresence', {
        activeBeatmap: null,
        activity: UserActivity.composeScreen({
          cursorPosition: this.mousePos,
          mouseDown: this.mouseDown,
          currentTime: this.editor.clock.currentTime,
          isPlaying: this.editor.clock.isPlaying,
        }),
      });
      this.lastUpdate = now;
    }
  }

  addUserCursor(user: UserSessionInfo) {
    if (user.sessionId === this.editor.connectedUsers.ownUser?.value?.sessionId)
      return;

    const cursor = new RemoteCursor(user);
    this.addChild(cursor);
  }

  removeUserCursor(userId: UserId) {
    const cursor = this.children.find(
      (c) => (c as RemoteCursor).user.id === userId,
    );
    if (cursor) {
      this.removeChild(cursor);
    }
  }
}

class RemoteCursor extends Drawable {
  constructor(public user: UserSessionInfo) {
    super();
  }

  @Inject(EditorContext)
  private editor!: EditorContext;

  private username!: BitmapText;

  onLoad() {
    const onUpdate = this.onActivityReceived.bind(this);
    this.editor.socket.on('userActivity', onUpdate);
    this.on('removed', () => {
      this.editor.socket.off('userActivity', onUpdate);
    });

    this.addChild(
      new Sprite({
        texture: Assets.get('icon-select'),
        anchor: new Point(0.2, 0.2),
        scale: new Point(0.4, 0.4),
        tint: 0x63e2b7,
      }),
    );

    this.username = this.addChild(
      new BitmapText({
        text: this.user.username,
        x: 20,
        y: 0,
        style: {
          fontFamily: 'Nunito Sans',
          fontSize: 12,
        },
        alpha: 0.5,
      }),
    );
  }

  onTick() {
    const parent = this.parent as CursorContainer;
    const distance = Vec2.distance(this.position, parent.mousePos);

    this.username.alpha = animate(distance, 0, 150, 1, 0);
  }

  onActivityReceived(sessionId: number, activity: UserActivity) {
    if (sessionId !== this.user.sessionId) return;

    if (activity.type === 'composeScreen') {
      gsap.to(this.position, {
        x: activity.cursorPosition.x,
        y: activity.cursorPosition.y,
        duration: 0.05,
      });
      gsap.to(this, {
        alpha: animate(
          Math.abs(
            activity.currentTime - this.editor.clock.currentTimeAnimated,
          ),
          500,
          1500,
          1,
          0,
        ),
        duration: 0.05,
      });
    } else {
      gsap.to(this, { alpha: 0, duration: 0.5 });
    }
  }
}
