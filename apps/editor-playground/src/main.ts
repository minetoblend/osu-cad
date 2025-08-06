import "./styles.css";

import { WebGameHost } from "@osucad/framework";
import { EditorPlayground } from "./EditorPlayground";

const host = new WebGameHost();
void host.run(new EditorPlayground());
