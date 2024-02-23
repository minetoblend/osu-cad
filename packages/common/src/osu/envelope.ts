export class Envelope {
  constructor(options: SerializedEnvelope) {
    this.controlPoints = options.controlPoints.map(
      (x) => new EnvelopeControlPoint(x),
    );
  }

  controlPoints: EnvelopeControlPoint[];

  serialize(): SerializedEnvelope {
    return {
      controlPoints: this.controlPoints.map((x) => x.serialize()),
    };
  }
}

export interface SerializedEnvelope {
  controlPoints: SerializedEnvelopeControlPoint[];
}

export class EnvelopeControlPoint {
  constructor(options: SerializedEnvelopeControlPoint) {
    this.time = options.time;
    this.value = options.value;
    this.type = AnchorType.Linear;
  }

  time: number;
  value: number;
  type: AnchorType;

  serialize(): SerializedEnvelopeControlPoint {
    return {
      time: this.time,
      value: this.value,
      type: this.type,
    };
  }
}

export interface SerializedEnvelopeControlPoint {
  time: number;
  value: number;
  type: AnchorType;
}

export const enum AnchorType {
  Linear,
  Constant,
}
