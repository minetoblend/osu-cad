import {Container, IDestroyOptions, Sprite, Texture} from "pixi.js";
import {Ref, ref, watch} from "vue";
import {Lifetime} from "@/util/disposable";

import score0 from '@/assets/skin/default-0.png'
import score1 from '@/assets/skin/default-1.png'
import score2 from '@/assets/skin/default-2.png'
import score3 from '@/assets/skin/default-3.png'
import score4 from '@/assets/skin/default-4.png'
import score5 from '@/assets/skin/default-5.png'
import score6 from '@/assets/skin/default-6.png'
import score7 from '@/assets/skin/default-7.png'
import score8 from '@/assets/skin/default-8.png'
import score9 from '@/assets/skin/default-9.png'


export class ComboNumberDrawable extends Container {

    #lifetime = new Lifetime()

    static scoreTextures = [
        score0,
        score1,
        score2,
        score3,
        score4,
        score5,
        score6,
        score7,
        score8,
        score9,
    ].map(t => Texture.from(t))

    constructor(comboNumber = 0) {
        super();
        this.comboNumber = ref(comboNumber)
        this.#lifetime.add(watch(this.comboNumber, () => this.#update()))
    }

    readonly comboNumber: Ref<number>

    #update() {
        this.removeChildren()

        const digits: Sprite[] = []

        let combo = this.comboNumber.value
        while (combo > 0) {
            const sprite = new Sprite(ComboNumberDrawable.scoreTextures[combo % 10])
            sprite.anchor.set(0.5)
            sprite.scale.set(0.85)
            combo = Math.floor(combo / 10)
            digits.unshift(sprite)
            this.addChild(sprite)
        }

        let gap = 30;
        const width = gap * (digits.length - 1)
        digits.forEach((it, index) => {
            it.position.set(
                -width / 2 + index * gap, 0)
        })

    }

    destroy(_options?: IDestroyOptions | boolean) {
        super.destroy(_options);
        this.#lifetime.dispose()
    }

}