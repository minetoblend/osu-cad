export interface DynamicsParameters
{
  readonly frequency: number
  readonly damping: number
  readonly response: number
}

export class SecondOrderDynamics
{
  previous: number;
  current: number;
  velocity: number;
  private k1!: number;
  private k2!: number;
  private k3!: number;

  constructor(initialValue: number, parameters: DynamicsParameters)
  {
    this.setParameters(parameters);

    // initialize variables
    this.previous = initialValue;
    this.current = initialValue;
    this.velocity = 0;
  }

  setParameters({ frequency, damping, response }: DynamicsParameters)
  {
    this.k1 = damping / (Math.PI * frequency);
    this.k2 = 1 / (2 * Math.PI * frequency * (2 * Math.PI * frequency));
    this.k3 = (response * damping) / (2 * Math.PI * frequency);
  }


  public update(dt: number, target: number, velocity?: number): number
  {
    if (velocity === undefined)
    {
      // estimate velocity
      velocity = (target - this.previous) / dt;
      this.previous = target;
    }

    const k2_stable = Math.max(
        this.k2,
        (dt * dt) / 2 + (dt * this.k1) / 2,
        dt * this.k1,
    ); // clamp k2 to guarantee stability

    this.current = this.current + dt * this.velocity; // integrate position by velocity
    this.velocity =
        this.velocity +
        (dt * (target + this.k3 * velocity - this.current - this.k1 * this.velocity)) / k2_stable; // integrate velocity by acceleration

    return this.current;
  }
}
