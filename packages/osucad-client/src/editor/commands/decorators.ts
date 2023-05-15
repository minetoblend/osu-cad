import "reflect-metadata";

const metadataKey = Symbol("CommandMetadata");

export function Toggle() {
  return (target: any, propertyKey: string) => {};
}

export function KeyStroke(key: string, description?: string) {
  return (target: any, propertyKey: string) => {};
}

export function Value(type: "string" | "number") {
  return (target: any, propertyKey: string) => {};
}

export function Prop(optionsOrPropType: PropType | PropOptions) {
  return (target: any, propertyKey: string) => {
    if (typeof optionsOrPropType === "string") {
      getCommandMetadata(target.constructor).props.push({
        name: propertyKey,
        type: optionsOrPropType,
        hidden: false,
      });
    } else {
      getCommandMetadata(target.constructor).props.push({
        name: propertyKey,
        type: optionsOrPropType.type,
        hidden: optionsOrPropType.hidden ?? false,
        constraint: optionsOrPropType.constraint,
      });
    }
  };
}

export function MouseMovement() {
  return (target: any, propertyKey: string) => {};
}

export type PropOptions = PropBaseOptions & PropTypeOptions;

export type PropTypeOptions =
  | {
      type: Exclude<PropType, "enum">;
    }
  | {
      type: "enum";
      values: string[];
    };

export type PropBaseOptions = {
  hidden?: boolean;
  modelValue?: boolean;
  constraint?: (c: any) => any;
};

export type PropType = "number" | "boolean" | "string" | "enum" | "Vec2";

export interface CommandMetadata {
  props: PropMetadata[];
  modelValue?: string;
}

export interface PropMetadata {
  name: string;
  type: PropType;
  hidden: boolean;
}

export function getCommandMetadata(constructor: any): CommandMetadata {
  if (!Reflect.hasMetadata(metadataKey, constructor)) {
    Reflect.defineMetadata(metadataKey, { props: [] }, constructor);
  }
  return Reflect.getMetadata(metadataKey, constructor);
}
