import "./styles.css";

import { Vec2, WebGameHost } from "@osucad/framework";
import { OsucadGame } from "./OsucadGame";
import type { DDSAttributes } from "@osucad/multiplayer";
import { ClientRuntime, ObjectDDS, type } from "@osucad/multiplayer";

const host = new WebGameHost();
void host.run(new OsucadGame());


class HitObject extends ObjectDDS
{
  static readonly Attributes: DDSAttributes = {
    type: "@osucad/hitobject",
    version: 0,
  };

  constructor()
  {
    super(HitObject.Attributes);
  }

  @type("float64")
  accessor startTime = 0;

  @type("vec2")
  accessor position = new Vec2();

  @type("boolean")
  accessor newCombo = false;

  @type("uint8")
  accessor comboOffset = 0
}

const runtime = new ClientRuntime([HitObject]);
const hitObject = new HitObject();

runtime.attach(hitObject);

hitObject.startTime = 10;
hitObject.startTime = 20;

console.log(hitObject.startTime);

runtime.history.undo();

console.log(hitObject.startTime);

runtime.history.redo();

console.log(hitObject.startTime);
