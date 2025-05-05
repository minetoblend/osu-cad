export class Timer 
{
  total = 0;

  start() 
  {
    return performance.now();
  }

  stop(start: number) 
  {
    this.total += performance.now() - start;
  }

  clear() 
  {
    this.total = 0;
  }

  measure<T>(fn: () => T): T 
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
