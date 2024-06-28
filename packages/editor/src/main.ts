import {WebGameHost} from 'osucad-framework'
import { OsucadGame } from './OsucadGame'

import './style.css'
import { DummyEditorContext } from './editor/context/DummyEditorContext'

const host = new WebGameHost('osucad', {
  friendlyGameName: 'osucad',
})

const context = new DummyEditorContext()

host.run(new OsucadGame(context))