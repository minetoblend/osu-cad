import { Playground } from '../playground/Playground';
import { Axes, dependencyLoader } from '../../../framework/src';
import { IntroSequence } from './IntroSequence';

export class IntroSequencePlayground extends Playground {

  @dependencyLoader()
  load() {


    this.addInternal(new IntroSequence())
  }

}
