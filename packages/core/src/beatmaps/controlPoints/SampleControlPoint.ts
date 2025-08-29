import { type, type DDSAttributes } from "@osucad/multiplayer-core";
import { ControlPoint } from "./ControlPoint";
import { Bindable } from "@osucad/framework";
import { SampleSet } from "../../audio";

export class SampleControlPoint extends ControlPoint
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/sample-control-point",
    version: 0,
  };

  public static readonly Default = new SampleControlPoint();

  public constructor()
  {
    super(SampleControlPoint.attributes);
  }

  public readonly beatLengthBindable = new Bindable(60_000 / 120);

  @type("int32")
  public accessor volume: number = 100

  @type("uint8")
  public accessor sampleSet: SampleSet = SampleSet.Soft

  @type("uint16")
  public accessor sampleIndex: number = 0
}
