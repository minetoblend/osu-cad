import { type, type DDSAttributes } from "@osucad/multiplayer-core";
import { ControlPoint } from "./ControlPoint";
import { Bindable } from "@osucad/framework";
import { bindableBacked } from "../../utils";

export class TimingControlPoint extends ControlPoint
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/timing-control-point",
    version: 0,
  };

  static readonly Default = new TimingControlPoint();

  constructor()
  {
    super(TimingControlPoint.attributes);
  }

  readonly beatLengthBindable = new Bindable(60_000 / 120);

  @type("float64")
  @bindableBacked("beatLengthBindable")
  accessor beatLength!: number;

  get bpm(): number
  {
    return 60_000 / this.beatLength;
  }

  set bpm(value: number)
  {
    this.beatLength = 60_000 / value;
  }

  readonly signatureBindable = new Bindable(4);

  @type("float64")
  @bindableBacked("signatureBindable")
  accessor signature!: number;
}
