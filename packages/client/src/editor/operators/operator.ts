import {Parameter} from "./parameter.ts";
import "reflect-metadata";
import {EditorContext} from "@/editor/editorContext.ts";

export interface OperatorContext {
  editor: EditorContext;
}

export interface OperatorOptions {
  label: string;
}

export abstract class Operator {
  private _parameters?: Parameter<any>[];

  get parameters() {
    if (this._parameters === undefined) {
      this._parameters = [];
      for (const key in this) {
        if (this[key] && this[key] instanceof Parameter) {
          this._parameters.push(this[key as keyof this] as Parameter<any>);
        }
      }
    }
    return this._parameters;
  }

  label: string

  abstract execute(context: OperatorContext): boolean;

  constructor(options: OperatorOptions) {
    const {label} = options;
    this.label = label;
  }

}