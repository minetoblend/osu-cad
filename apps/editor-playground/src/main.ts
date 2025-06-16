import "./styles.css";

import { WebGameHost } from "@osucad/framework";
import { EditorPlayground } from "./EditorPlayground";

const host = new WebGameHost("osucad");
void host.run(new EditorPlayground());
