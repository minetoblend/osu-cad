import {SerializedEditorBookmark} from "../types";

export class EditorBookmark {
  time: number;
  name: string | null;

  constructor(options: SerializedEditorBookmark) {
    this.time = options.time;
    this.name = options.name;
  }

  serialize(): SerializedEditorBookmark {
    return {
      time: this.time,
      name: this.name,
    };
  }

}