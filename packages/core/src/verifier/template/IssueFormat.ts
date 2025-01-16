import type { Formatter } from './Formatter';
import type { FormatToken } from './Tokens';
import { Anchor, Drawable } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { TextBlock } from '../../drawables/TextBlock';
import { OsucadColors } from '../../OsucadColors';
import { beatmap, defaultFormatter, fixedPrecision, maxPrecision, timestamp } from './Formatter';

const placeholderRegex = /\{(?<index>\d+)(?::(?<format>[#\w.]+))?\}/g;

export class IssueFormat {
  private constructor(readonly tokens: readonly FormatToken[]) {
  }

  * #createWords(text: string) {
    for (const word of text.split(' ')) {
      yield new OsucadSpriteText({
        text: word,
        color: OsucadColors.text,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        fontSize: 13,
      });
    }
  }

  * format(args: any[]): Generator<Drawable, void, undefined> {
    const parts = this.getParts(args);

    if (parts.every(part => typeof part === 'string')) {
      yield new TextBlock({
        text: parts.join(''),
        fontSize: 13,
        color: OsucadColors.text,
      });
      return;
    }

    for (const part of this.getParts(args)) {
      if (part instanceof Drawable)
        yield part;
      else
        yield * this.#createWords(part);
    }
  }

  getParts(args: any[]) {
    const parts: (string | Drawable)[] = [];

    let currentString = '';

    for (const token of this.tokens) {
      if (typeof token === 'string') {
        currentString += token;
      }
      else {
        const { index, format } = token;

        let value = args[index];

        value = format?.(value);

        value ??= '';

        if (value instanceof Drawable) {
          if (currentString.length > 0) {
            parts.push(currentString);
            currentString = '';
          }
          parts.push(value);
        }
        else {
          currentString += value;
        }
      }
    }

    if (currentString.length > 0)
      parts.push(currentString);

    return parts;
  }

  static parse(format: string) {
    const tokens: FormatToken[] = [];

    const matches = format.matchAll(placeholderRegex);

    let startIndex = 0;

    for (const match of matches) {
      if (match.index > startIndex)
        tokens.push(format.slice(startIndex, match.index));

      startIndex = match.index + match[0].length;

      const placeholderIndex = Number.parseInt(match.groups!.index);
      const placeholderFormat = match.groups!.format;

      if (!Number.isFinite(placeholderIndex))
        throw new Error(`Failed to parse placeholder index "${match.groups!.index}"`);
      if (placeholderIndex < 0)
        throw new Error(`Index must be at least 1, got ${match.groups!.index}`);

      let formatter: Formatter = defaultFormatter;

      if (placeholderFormat) {
        if (/ˆ#+$/.test(placeholderFormat))
          formatter = fixedPrecision(placeholderFormat.length);
        else if (/ˆ#+\?$/.test(placeholderFormat))
          formatter = maxPrecision(placeholderFormat.length - 1);
        else if (placeholderFormat === 'timestamp')
          formatter = timestamp();
        else if (placeholderFormat === 'beatmap')
          formatter = beatmap;
      }

      tokens.push({
        type: 'placeholder',
        format: formatter,
        index: placeholderIndex,
      });
    }

    if (startIndex < format.length)
      tokens.push(format.slice(startIndex, format.length));

    return new IssueFormat(tokens);
  }
}
