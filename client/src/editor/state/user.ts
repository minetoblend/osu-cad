import {ref} from "vue";
import {Color, Vec2} from "@/util/math";
import {hslToColor} from "@/util/color";

export class UserState {

    readonly users = ref<UserData[]>([])
    readonly colors = new Map<string, Color>()
    sessionId = ''

    counter = 1 + Math.floor(Math.random() * 1000)

    readonly ownColor = new Color(245, 208, 61).divF(255)

    update(payload: any[]) {
        this.users.value = payload.map(it => {

            let color = this.colors.get(it.id)
            if (it.id === this.sessionId) {
                color = this.ownColor
            }
            if (!color) {
                const hue = ((this.counter++) * (1 / Math.PI)) % 1

                color = hslToColor(hue, 1, 0.75)

                this.colors.set(it.id, color)
            }


            return {
                sessionId: it.id,
                userId: it.userId,
                username: it.username,
                currentTime: it.currentTime,
                color,
                cursorPos: Vec2.fromOpt(it.cursorPos) ?? null
            }
        })
    }

    setJoinInfo(payload: { sessionId: string }) {
        this.sessionId = payload.sessionId
    }

    findById(sessionId: string) {
        return this.users.value.find(it => it.sessionId === sessionId)
    }

    getColor(id: string) {
        return this.colors.get(id) ?? this.ownColor
    }
}

interface UserData {
    sessionId: string
    userId: string
    username: string
    currentTime: number
    color: Color
    cursorPos: Vec2 | null
}