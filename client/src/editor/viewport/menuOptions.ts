import {MenuOption} from "naive-ui";
import {h} from "vue";

import cursorIcon from '@/assets/menu-cursor.png'
import circleIcon from '@/assets/hitcircle.png'
import sliderIcon from '@/assets/slider.png'

export const ViewportMenuOptions: MenuOption[] = [
    {
        label: 'Select',
        key: 'select',
        disabled: false,
        icon: () => h('img', {
            src: cursorIcon,
            width: 32,
            height: 32
        })
    }, {
        label: 'Hitcircle',
        key: 'circle',
        disabled: false,
        icon: () => h('img', {
            src: circleIcon,
            width: 32,
            height: 32
        })
    },
    {
        label: 'Slider',
        key: 'slider',
        disabled: false,
        icon: () => h('img', {
            src: sliderIcon,
            width: 32,
            height: 32
        })
    }
]