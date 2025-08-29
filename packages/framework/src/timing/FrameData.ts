export class FrameData<T>
{
  public constructor(
    public content: T,
    public duration: number,
  )
  {}

  public displayStartTime = 0;

  public get displayEndTime()
  {
    return this.displayStartTime + this.duration;
  }
}
