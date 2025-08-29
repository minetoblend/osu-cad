import { type, type DDSAttributes } from "@osucad/multiplayer-core";
import { ControlPoint } from "./ControlPoint";
import { Bindable } from "@osucad/framework";
import { bindableBacked } from "../../utils";

export class TimingControlPoint extends ControlPoint
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/timing-control-point",
    version: 0,
  };

  public static readonly Default = new TimingControlPoint();

  public constructor()
  {
    super(TimingControlPoint.attributes);
  }

  public readonly beatLengthBindable = new Bindable(60_000 / 120);

  @type("float64")
  @bindableBacked("beatLengthBindable")
  public accessor beatLength!: number;

  public get bpm(): number
  {
    return 60_000 / this.beatLength;
  }

  public set bpm(value: number)
  {
    this.beatLength = 60_000 / value;
  }

  public readonly signatureBindable = new Bindable(4);

  @type("float64")
  @bindableBacked("signatureBindable")
  public accessor signature!: number;
}
