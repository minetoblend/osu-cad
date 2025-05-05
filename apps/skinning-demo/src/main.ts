import './styles.css'

import { WebGameHost } from "@osucad/framework";
import { SkinningDemo } from "./SkinningDemo";

const host = new WebGameHost('osucad')
void host.run(new SkinningDemo())
