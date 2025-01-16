import type { IssueLevel } from '../Issue';
import { IssueFormat } from './IssueFormat';

export interface IssueTemplateOptions {
  level: IssueLevel;
  format: string;
  placeholders?: any[];
  cause?: string;
}

export class IssueTemplate {
  cause: string | null = null;

  readonly #format: IssueFormat;
  readonly placeholders: string[];

  constructor(readonly level: IssueLevel, format: string, ...placeholders: any[]) {
    this.#format = IssueFormat.parse(format);
    this.placeholders = placeholders ?? [];
  }

  withCause(cause: string): this {
    this.cause = cause;
    return this;
  }

  format(args: any[]) {
    return this.#format.format(args);
  }

  get placeholderText() {
    return this.#format.format(this.placeholders);
  }
}
