import { WebGameHost } from '@osucad/framework';
import { PlaceGame } from './PlaceGame';

const host = new WebGameHost('place');

host.run(new PlaceGame());
