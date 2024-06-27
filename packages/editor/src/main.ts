import {WebGameHost} from 'osucad-framework'
import { OsucadGame } from './OsucadGame'

import './style.css'

const host = new WebGameHost('osucad', {
  friendlyGameName: 'osucad',
})

host.run(new OsucadGame())