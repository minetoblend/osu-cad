import { ObjectCrdt } from '../crdt/ObjectCrdt';

export class BeatmapMetadata extends ObjectCrdt {
  readonly #artist = this.property('artist', '');

  get artistBindable() {
    return this.#artist.bindable;
  }

  get artist() {
    return this.#artist.value;
  }

  set artist(value) {
    this.#artist.value = value;
  }

  readonly #artistUnicode = this.property('artistUnicode', '');

  get artistUnicodeBindable() {
    return this.#artistUnicode.bindable;
  }

  get artistUnicode() {
    return this.#artistUnicode.value;
  }

  set artistUnicode(value) {
    this.#artistUnicode.value = value;
  }

  readonly #title = this.property('title', '');

  get titleBindable() {
    return this.#title.bindable;
  }

  get title() {
    return this.#title.value;
  }

  set title(value) {
    this.#title.value = value;
  }

  readonly #titleUnicode = this.property('titleUnicode', '');

  get titleUnicodeBindable() {
    return this.#titleUnicode.bindable;
  }

  get titleUnicode() {
    return this.#titleUnicode.value;
  }

  set titleUnicode(value) {
    this.#titleUnicode.value = value;
  }

  readonly #source = this.property('source', '');

  get sourceBindable() {
    return this.#source.bindable;
  }

  get source() {
    return this.#source.value;
  }

  set source(value) {
    this.#source.value = value;
  }

  readonly #tags = this.property('tags', '');

  get tagsBindable() {
    return this.#tags.bindable;
  }

  get tags() {
    return this.#tags.value;
  }

  set tags(value) {
    this.#tags.value = value;
  }

  readonly #previewTime = this.property('previewTime', -1);

  get previewTimeBindable() {
    return this.#previewTime.bindable;
  }

  get previewTime() {
    return this.#previewTime.value;
  }

  set previewTime(value) {
    this.#previewTime.value = value;
  }

  readonly #creator = this.property('creator', '');

  get creatorBindable() {
    return this.#creator.bindable;
  }

  get creator() {
    return this.#creator.value;
  }

  set creator(value) {
    this.#creator.value = value;
  }

  readonly #audioFile = this.property('audioFile', '');

  get audioFileBindable() {
    return this.#audioFile.bindable;
  }

  get audioFile() {
    return this.#audioFile.value;
  }

  set audioFile(value) {
    this.#audioFile.value = value;
  }

  readonly #backgroundFile = this.property<string | null>('backgroundFile', null);

  get backgroundFileBindable() {
    return this.#backgroundFile.bindable;
  }

  get backgroundFile() {
    return this.#backgroundFile.value;
  }

  set backgroundFile(value) {
    this.#backgroundFile.value = value;
  }
}
