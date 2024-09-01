import { Color } from 'pixi.js';
import { SkinConfiguration } from './SkinConfiguration';

enum Section {
  General = 'General',
  Colours = 'Colours',
  Fonts = 'Fonts',
  CatchTheBeat = 'CatchTheBeat',
  Mania = 'Mania',
}

export class StableSkinConfigurationDecoder {
  decode(buffer: ArrayBuffer) {
    const skin = new SkinConfiguration();

    const lines = new TextDecoder().decode(buffer).split('\n');

    let currentSection: Section | null = null;

    for (const line of lines) {
      if (line.startsWith('//'))
        continue;

      if (line.startsWith('[') && line.endsWith(']')) {
        const section = line.substring(1, line.length - 1);
        if (section in Section)
          currentSection = section as Section;

        continue;
      }

      if (!currentSection)
        continue;

      this.#parseLine(skin, currentSection, line);
    }

    console.log(skin);

    return skin;
  }

  #parseLine(skin: SkinConfiguration, section: Section, line: string) {
    const [key, value] = line.split(':').map(s => s.trim());
    if (!key || value === undefined)
      return;

    switch (section) {
      case Section.General:
        switch (key) {
          case 'Name':
            skin.skinInfo.name = value;
            return;
          case 'Author':
            skin.skinInfo.creator = value;
            return;

          case 'Version':
            if (value === 'latest')
              skin.version = '2.7';
            else if (!Number.isNaN(Number.parseFloat(value)))
              skin.version = value;
        }

        break;
      case Section.Colours: {
        const split = value.split(',');
        if (split.length !== 3)
          return;

        const isCombo = key.startsWith('Combo');
        if (isCombo) {
          skin.customComboColors.push(new Color(`rgb(${value})`));
        }
        else {
          skin.customColors.set(key, new Color(`rgb(${value})`));
        }
      }
    }

    if (key.length !== 0)
      skin.configMap.set(key, value);
  }
}
