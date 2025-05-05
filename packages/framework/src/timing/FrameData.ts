export class FrameData<T> 
{
  constructor(
    public content: T,
    public duration: number,
  ) 
  {}

  displayStartTime = 0;

  get displayEndTime() 
  {
    return this.displayStartTime + this.duration;
  }
}
