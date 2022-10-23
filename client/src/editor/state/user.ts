import {reactive, ref} from "vue";
import {Color} from "@/util/math";
import {hslToColor} from "@/util/color";
import {EditorContext} from "@/editor";
import {ServerTick, UserInfo} from "protocol/commands";
import {Observable, Subject} from "rxjs";

export class UserState {

    readonly users = reactive<UserData[]>([])
    readonly colors = new Map<number, Color>()
    readonly #sessionId = ref(-1)

    get sessionId() {
        return this.#sessionId.value
    }

    counter = 1 + Math.floor(Math.random() * 1000)

    readonly ownColor = new Color(245, 208, 61).divF(255)

    readonly forEach = this.users.forEach.bind(this.users)
    readonly find = this.users.find.bind(this.users)
    readonly filter = this.users.filter.bind(this.users)

    #onUserJoined = new Subject<UserData>()
    #onUserLeft = new Subject<UserData>()

    get onUserJoined() {
        return this.#onUserJoined as Observable<UserData>
    }

    get onUserLeft() {
        return this.#onUserLeft as Observable<UserData>
    }

    constructor(ctx: EditorContext) {
        ctx.connector.onCommand('userList').subscribe(({users}) => users.forEach(user => this.#addUser(user)))
        ctx.connector.onCommand('userLeft').subscribe(user => this.#handleLeave(user))
        ctx.connector.onCommand('ownId').subscribe(id => this.#sessionId.value = id)
        ctx.connector.onCommand('tick').subscribe(tick => this.#handleTick(tick))
    }

    #handleLeave(user: UserInfo) {
        const index = this.users.findIndex(t => t.sessionId === user.id)
        if (index >= 0) {
            const user = this.users[index]
            this.users.splice(index, 1)
            this.#onUserLeft.next(user)
        }
    }

    #handleTick(serverTick: ServerTick) {
        serverTick.userTicks.forEach(tick => {
            const user = this.findById(tick.id)
            if (user) {
                user.currentTime = tick.currentTime
            }
        })
    }

    #addUser(user: UserInfo) {
        if (this.users.some(it => it.sessionId === user.id))
            return;

        const hue = ((this.counter++) * (1 / Math.PI)) % 1

        const color = hslToColor(hue, 1, 0.75)
        this.colors.set(user.id, color)

        const data = {
            sessionId: user.id,
            color,
            username: user.displayName,
            currentTime: 0
        }

        this.users.push(data)

        this.#onUserJoined.next(data)
    }

    findById(sessionId: number) {
        return this.users.find(it => it.sessionId === sessionId)
    }

    getColor(id: number) {
        if (id === this.sessionId)
            return this.ownColor
        return this.colors.get(id) ?? this.ownColor
    }

}

export interface UserData {
    sessionId: number
    username: string
    color: Color
    currentTime: number
}