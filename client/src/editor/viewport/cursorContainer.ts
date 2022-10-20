import {BLEND_MODES, Container, Sprite, Text, Texture} from "pixi.js";
import cursorTexture from "@/assets/menu-cursor.png";
import {Vec2} from "@/util/math";
import {EditorContext} from "@/editor";
import {watchEffect} from "vue";
import gsap from 'gsap'
import {DropShadowFilter} from "@pixi/filter-drop-shadow";
import {animate} from "@/util/animation";
import {ServerOpCode} from "@common/opcodes";

export class CursorContainer extends Container {

    constructor(readonly ctx: EditorContext) {
        super();

        this.ownCursor = new Cursor(this, 0xffffff)
        this.addChild(this.ownCursor)
        this.ownCursor.zIndex = 1

        this.filters = [
            new DropShadowFilter({
                alpha: 0.3
            })
        ]

        watchEffect(() => this.updateUserCursors())

        this.ctx.commandHandler.onCommand.subscribe(it => {
            if (it.opCode === ServerOpCode.FailedSelectionAttempt) {
                const cursor = this.userCursors.get(it.payload.id)
                if (cursor) {
                    cursor.onSelectionFailed()
                } else if (it.payload.id === this.ctx.state.user.sessionId) {
                    this.ownCursor.onSelectionFailed()
                }
            }
        })
    }

    readonly ownCursor: Cursor
    readonly userCursors = new Map<string, Cursor>()
    private ownPos: Vec2 | null = null

    setOwnPos(pos: Vec2 | null) {
        this.ownPos = pos
        this.ownCursor.setPos(pos)

        this.userCursors.forEach(it => {
            it.updateTextVisible(pos)
        })
    }

    updateUserCursors() {
        const userState = this.ctx.state.user
        const users = userState.users.value

        const shouldDelete = new Set(this.userCursors.keys())

        users.forEach(userData => {
            if (userState.sessionId === userData.sessionId)
                return;

            const existing = this.userCursors.get(userData.sessionId)
            if (existing) {
                existing.setPos(userData.cursorPos, true)
                existing.updateTextVisible(this.ownPos)
                existing.setTime(userData.currentTime, this.ctx.clock.animatedTime)
                shouldDelete.delete(userData.sessionId)
            } else {
                const cursor = new Cursor(this, userData.color.hex, userData.username)
                this.addChild(cursor)
                this.userCursors.set(userData.sessionId, cursor)
                cursor.setPos(userData.cursorPos)
                cursor.updateTextVisible(this.ownPos)
                cursor.setTime(userData.currentTime, this.ctx.clock.animatedTime)
            }
        })

        if (shouldDelete.size > 0) {
            shouldDelete.forEach(key => {
                const component = this.userCursors.get(key)
                this.userCursors.delete(key)

                component?.playDisconnectAnimation().then(() => component?.destroy({children: true}))
            })
        }

        this.sortChildren()
    }
}

export class Cursor extends Container {
    constructor(readonly container: CursorContainer, color: number, name?: string) {
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

    setPos(position: Vec2 | null, animated = false) {
        if (position) {
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

        this.visible = !!position
    }

    updateTextVisible(pos: Vec2 | null) {
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