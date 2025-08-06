import "./styles.css";

import { WebGameHost } from "@osucad/framework";
import { SkinningDemo } from "./SkinningDemo";

const host = new WebGameHost();
void host.run(new SkinningDemo());
