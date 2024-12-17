import { dependencyLoader } from 'osucad-framework';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';

@editorScreen({
  id: 'compose',
  name: 'Compose',
})
export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
  }

  @dependencyLoader()
  [Symbol('load')]() {

  }
}
