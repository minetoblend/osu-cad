import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SharedMap} from "@osucad/unison";

export class BetamapMetadata extends SharedMap {

  constructor(runtime: IUnisonRuntime) {
    super(runtime, BetamapMetadataFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("titleUnicode", "");
    this.set("title", "");
    this.set("artistUnicode", "");
    this.set("artist", "");
    this.set("difficultyName", "");
  }

  get titleUnicode(): string {
    return this.get("titleUnicode") as string;
  }

  set titleUnicode(value: string) {
    this.set("titleUnicode", value);
  }

  get title(): string {
    return this.get("title") as string;
  }

  set title(value: string) {
    this.set("title", value);
  }

  get artistUnicode(): string {
    return this.get("artistUnicode") as string;
  }

  set artistUnicode(value: string) {
    this.set("artistUnicode", value);
  }

  get artist(): string {
    return this.get("artist") as string;
  }

  set artist(value: string) {
    this.set("artist", value);
  }

  get difficultyName(): string {
    return this.get("difficultyName") as string;
  }

  set difficultyName(value: string) {
    this.set("difficultyName", value);
  }

}

export class BetamapMetadataFactory implements ITypeFactory<BetamapMetadata> {
  static readonly Type = "@osucad/betamapMetadata";

  get type() {
    return BetamapMetadataFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: BetamapMetadataFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return BetamapMetadataFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): BetamapMetadata {
    return new BetamapMetadata(runtime);
  }
}
