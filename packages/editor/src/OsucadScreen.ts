import { Screen } from 'osucad-framework';

export abstract class OsucadScreen extends Screen {
  getPath?(): string;
}
