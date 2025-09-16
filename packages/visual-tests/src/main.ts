import { WebGameHost } from "@osucad/framework";
import { TestGame } from "./TestGame";

import "./style.css";

const game = new TestGame();

new WebGameHost().run(game);
