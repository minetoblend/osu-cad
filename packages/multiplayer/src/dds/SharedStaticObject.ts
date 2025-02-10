import type { ISequencedDocumentMessage } from '../interfaces/messages';
import { SharedStructure } from './SharedStructure';

export abstract class SharedStaticObject extends SharedStructure {
  override process(message: ISequencedDocumentMessage, local: boolean) {
    throw new Error('Object cannot be mutated.');
  }

  override replayOp(contents: unknown) {
    throw new Error('Object cannot be mutated.');
  }
}
