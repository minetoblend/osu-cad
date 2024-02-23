import { Operator } from './operator.ts';

export function registerOperator() {
  return <T extends Operator>(constructor: new () => T) => {
    return constructor;
  };
}
