import "./styles.css";

import { RecorderGameHost } from "@osucad/framework";
import { SkinningDemo } from "./SkinningDemo";

const host = new RecorderGameHost();;

const game = new SkinningDemo();

void host.record(game, {
  width: 1920 * 2,
  height: 1080 * 2,
  framerate: 60,
  duration: 30_000,
});
