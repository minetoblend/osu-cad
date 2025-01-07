import logoText from './assets/textures/logo-text.webp'
import osucadText from './assets/textures/osucad-text.webp'
import { LazyTexture } from "./LazyTexture";


export class OsucadTextures {
  static logoText = new LazyTexture(logoText)
  static osucadText = new LazyTexture(osucadText)
}
