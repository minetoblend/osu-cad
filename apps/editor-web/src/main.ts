import "./styles.css";

import { WebGameHost } from "@osucad/framework";
import { OsucadGame } from "./OsucadGame";

const host = new WebGameHost();
void host.run(new OsucadGame());
