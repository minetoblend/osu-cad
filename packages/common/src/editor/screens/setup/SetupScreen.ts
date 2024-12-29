import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';

@editorScreen({
  id: 'setup',
  name: 'Setup',
})
export class SetupScreen extends EditorScreen {
  constructor() {
    super();
  }
}
