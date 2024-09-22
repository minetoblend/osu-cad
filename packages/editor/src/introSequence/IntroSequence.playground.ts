import { Playground } from '../playground/Playground.ts';
import { Axes, dependencyLoader } from '../../../framework/src';
import { IntroSequence } from './IntroSequence.ts';

export class IntroSequencePlayground extends Playground {

  @dependencyLoader()
  load() {


    this.addInternal(new IntroSequence())
  }

}
