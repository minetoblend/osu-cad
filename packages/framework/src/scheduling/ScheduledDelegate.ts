import { debugAssert } from "../utils/debugAssert";

export class ScheduledDelegate 
{
  constructor(
    readonly task: () => void,
    public executionTime: number = 0,
    public repeatInterval: number = -1,
    public receiver?: any,
  ) 
  {}

  performRepeatCatchUpExecutions = true;

  public get completed() 
  {
    return this.state === RunState.Complete;
  }

  get cancelled() 
  {
    return this.state === RunState.Cancelled;
  }

  #state: RunState = RunState.Waiting;

  get state(): RunState 
  {
    return this.#state;
  }

  runTask() 
  {
    if (this.cancelled) 
    {
      throw new Error("Cannot run a canceled task");
    }

    if (this.completed) 
    {
      throw new Error("Cannot run a completed task");
    }

    this.runTaskInternal();
  }

  runTaskInternal() 
  {
    if (this.state !== RunState.Waiting)
      return;

    this.#state = RunState.Running;

    this.invokeTask();

    // @ts-expect-error type checker is being stupid here
    if (this.state === RunState.Cancelled)
      return;

    // @ts-expect-error type checker is being stupid here
    debugAssert(this.state === RunState.Running);
    this.#state = RunState.Complete;
  }

  protected invokeTask() 
  {
    if (this.receiver) 
    {
      this.task.call(this.receiver);
    }
    else 
    {
      this.task();
    }
  }

  cancel() 
  {
    this.#state = RunState.Cancelled;
  }

  setNextExecution(currentTime: number | null) 
  {
    if (this.state === RunState.Cancelled)
      return;

    this.#state = RunState.Waiting;

    if (currentTime !== null) 
    {
      this.executionTime += this.repeatInterval;

      if (this.executionTime < currentTime && !this.performRepeatCatchUpExecutions)
        this.executionTime = currentTime + this.repeatInterval;
    }
  }
}

export enum RunState 
{
  Waiting = 0,
  Running = 1,
  Complete = 2,
  Cancelled = 3,
}
