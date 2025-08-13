import { type, type DDSAttributes } from "@osucad/multiplayer-core";
import { ControlPoint } from "./ControlPoint";
import { Bindable } from "@osucad/framework";
import { SampleSet } from "../../audio";

export class SampleControlPoint extends ControlPoint
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/sample-control-point",
    version: 0,
  };

  static readonly Default = new SampleControlPoint();

  constructor()
  {
    super(SampleControlPoint.attributes);
  }

  readonly beatLengthBindable = new Bindable(60_000 / 120);

  @type("int32")
  accessor volume: number = 100

  @type("uint8")
  accessor sampleSet: SampleSet = SampleSet.Soft

  @type("uint16")
  accessor sampleIndex: number = 0
}
