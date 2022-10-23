import {BLEND_MODES, Container, Sprite, Text, Texture} from "pixi.js";
import cursorTexture from "@/assets/menu-cursor.png";
import {Vec2, Vec2Like} from "@/util/math";
import {EditorContext} from "@/editor";
import gsap from 'gsap'
import {DropShadowFilter} from "@pixi/filter-drop-shadow";
import {animate} from "@/util/animation";
import {UserData} from "@/editor/state/user";
import {ServerTick} from "protocol/commands";
import {watchEffect} from "vue";

export class CursorContainer extends Container {

    constructor(readonly ctx: EditorContext) {
        super();

        this.ownCursor = new Cursor(0xffffff)
        this.addChild(this.ownCursor)
        this.ownCursor.zIndex = 1

        this.filters = [
            new DropShadowFilter({
                alpha: 0.3
            })
        ]


        this.ctx.connector.onCommand('tick').subscribe(tick => this.onTick(tick))
        watchEffect(() => {
            this.ctx.users.forEach(user => this.onUserJoined(user))
        })
        this.ctx.users.onUserLeft.subscribe(user => this.onUserLeft(user))

    }


    readonly ownCursor: Cursor
    readonly userCursors = new Map<number, Cursor>()
    private ownPos: Vec2 | undefined = undefined

    setOwnPos(pos: Vec2 | undefined) {
        this.ownPos = pos
        this.ownCursor.setPos(pos)

        this.userCursors.forEach(it => {
            it.updateTextVisible(pos)
        })
    }

    onUserJoined(user: UserData) {
        if (this.userCursors.has(user.sessionId) || user.sessionId === this.ctx.users.sessionId || this.ctx.users.sessionId < 0)
            return;

        const cursor = new Cursor(user.color.hex, user.username)
        this.userCursors.set(user.sessionId, cursor)
        this.addChild(cursor)
    }

    onUserLeft(user: UserData) {
        const cursor = this.userCursors.get(user.sessionId)
        if (cursor) {
            this.userCursors.delete(user.sessionId)
            cursor.destroy({children: true})
        }
    }


    onTick(tick: ServerTick) {
        tick.userTicks.forEach(userTick => {
            const cursor = this.userCursors.get(userTick.id)
            if(cursor) {
                cursor?.setPos(userTick.cursorPos, true)
                cursor.setTime(userTick.currentTime, this.ctx.clock.animatedTime)
            }
        })
    }
}

export class Cursor extends Container {
    constructor(color: number, name?: string) {
        super();
        const cursorSprite = new Sprite(Texture.from(cursorTexture))
        this.addChild(cursorSprite)
        cursorSprite.scale.set(0.3)
        cursorSprite.tint = color
        cursorSprite.blendMode = BLEND_MODES.NORMAL
        cursorSprite.anchor.set(0.05, 0)
        this.cursorSprite = cursorSprite

        if (name) {
            this.text = new Text(name, {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: color,
                align: 'center',
            });
            this.text.position.set(20, 20)
            this.text.scale.set(0)
            this.addChild(this.text)
        }
        this.initTimeline()
    }

    private readonly cursorSprite: Sprite;

    private tween?: gsap.core.Tween
    private text?: Text

    setTime(time: number, ownTime: number) {
        const difference = Math.abs(time - ownTime)

        const alpha = animate(difference, 500, 1500, 1, 0)

        gsap.to(this, {alpha, duration: 0.2})
    }

    setPos(pos: Vec2Like | undefined, animated = false) {

        if (pos) {
            const position = Vec2.from(pos)
            const oldPos = Vec2.from(this.position)
            if (!oldPos.equals(position)) {
                if (this.tween) {
                    this.tween.kill()
                    this.tween = undefined
                }
                if (animated && this.visible) { //only animate if cursor was visible on previous frame
                    this.tween = gsap.to(this.position, {
                        duration: 0.25,
                        x: position.x,
                        y: position.y
                    })
                } else {
                    this.position.copyFrom(position)
                }
            }
        }

        // this.visible = !!pos
    }

    updateTextVisible(pos: Vec2 | undefined) {
        if (!pos)
            this.setTextVisible(false)

        else {
            const distance = Vec2.from(this.position).sub(pos).lengthSquared
            this.setTextVisible(distance < 6400)
        }
    }

    textVisible = false

    setTextVisible(visible: boolean) {
        if (!this.text)
            return

        if (visible && !this.textVisible) {
            gsap.to(this.text.scale, {
                x: 0.5,
                y: 0.5,
                duration: 0.2,
            })
        } else if (!visible && this.textVisible) {
            gsap.to(this.text.scale, {
                x: 0,
                y: 0,
                duration: 0.2,
            })
        }
        this.textVisible = visible
    }

    readonly selectionFailedTimeline = gsap.timeline({paused: true})

    initTimeline() {

        this.selectionFailedTimeline
            .to(this.cursorSprite, {x: -5, y: -9, duration: 0.08})
            .to(this.cursorSprite, {x: 0, y: 0, duration: 0.2}, '>')


    }

    onSelectionFailed() {
        this.selectionFailedTimeline.play(0)
    }

    playDisconnectAnimation() {
        return gsap.to(this.cursorSprite, {alpha: 0, y: 20, duration: 0.8, ease: "power1.in"})
    }

}