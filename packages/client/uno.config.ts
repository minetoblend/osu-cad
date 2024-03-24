import { defineConfig, presetAttributify, presetTypography, presetUno } from 'unocss';
import { presetGrid } from 'unocss-preset-grid';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';
import presetIcons from '@unocss/preset-icons';
import { presetScrollbar } from 'unocss-preset-scrollbar';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetGrid(),
    presetScrollbar(),
    presetIcons({
      collections: {
        fas: () => import('@iconify-json/fa6-solid/icons.json').then((m) => m.default)
      }
    })
  ],
  theme: {
    container: {
      padding: {
        'DEFAULT': 0
      },
      maxWidth: {
        lg: '1024px'
      }
    },
    colors: {
      gray: {
        100: '#0B0B0D',
        200: '#1A1A20',
        300: '#282832',
        400: '#373744',
        500: '#777788',
        600: '#9696A2',
        700: '#B5B5BD',
        800: '#D3D3D7',
        900: '#F2F2F2'
      },
      primary: {
        100: '#042922',
        200: '#0C3D31',
        300: '#1A644F',
        400: '#288C6C',
        500: '#36B38A',
        600: '#3DC699',
        700: '#4BEEB7',
        800: '#80F6C4',
        900: '#B3FED1'
      }
    }

  },
  shortcuts: [
    {
      'cover-parent': 'w-full h-full object-cover',
      'skeleton': 'bg-gray-400 rounded inline-block',
      'skeleton-text': 'skeleton h-1.5em',
      'btn': 'px-4 py-2 rounded no-underline'
    },
    [/btn-(.*)/, (m) => `btn bg-${m[1]} text-white`]
  ],
  rules: [
    ['glow', {
      '--glow-radius': '0.5rem',
      'box-shadow': '0 0 var(--glow-radius) var(--glow-color)'
    }],
    [/^glow-(.*)$/, ([,c], {theme}) => {
      if(theme.colors[c]) {
        return {
          '--glow-color': `rgba(${theme[c]}, 0.5)`,
        }
      }
    }]
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
});
