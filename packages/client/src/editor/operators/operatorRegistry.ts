import {Operator} from "./operator.ts";


export interface OperatorOptions {
  id: string;
  label: string;
}

export function registerOperator(options: OperatorOptions) {
  return <T extends Operator>(constructor: new () => T) => {
    return constructor;
  };
}