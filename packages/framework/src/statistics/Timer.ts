export class Timer
{
  public total = 0;

  public start()
  {
    return performance.now();
  }

  public stop(start: number)
  {
    this.total += performance.now() - start;
  }

  public clear()
  {
    this.total = 0;
  }

  public measure<T>(fn: () => T): T
  {
    const start = performance.now();

    try
    {
      return fn();
    }
    finally
    {
      this.total += performance.now() - start;
    }
  }
}
