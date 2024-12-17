import 'reflect-metadata';

export interface EditorScreenMetadata {
  id: string;
  name: string;
}

const metadataKey = Symbol('editorScreen');

export function editorScreen(options: EditorScreenMetadata): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(metadataKey, options, target);
  };
}

export function getEditorScreenMetadata(target: any): EditorScreenMetadata | undefined {
  return Reflect.getMetadata(metadataKey, target);
}
