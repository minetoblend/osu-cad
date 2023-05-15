import { EditorInstance } from "@/editor/createEditor";
import { PropMetadata, getCommandMetadata } from "./decorators";

export abstract class Command {
  abstract id: string;
  abstract name: string;

  interactive = false;

  constructor(private readonly editor: EditorInstance) {
    const metadata = getCommandMetadata(this.constructor);
    this.props = metadata.props;
  }

  props: PropMetadata[];

  setup?(): void | false;

  abort?(): void;

  abstract apply(): void;

  protected get selection() {
    return this.editor.selection;
  }

  protected get hitObjects() {
    return this.editor.hitObjects;
  }

  cleanup() {}

  propValues() {
    return this.props.map((prop) => (this as any)[prop.name].value);
  }
}
