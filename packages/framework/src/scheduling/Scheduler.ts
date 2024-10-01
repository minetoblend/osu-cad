import { type IClock, StopwatchClock } from '../timing';
import { ScheduledDelegate } from './ScheduledDelegate';

export class Scheduler {
  readonly #runQueue: ScheduledDelegate[] = [];
  readonly #timedTasks: ScheduledDelegate[] = [];
  readonly #perUpdateTasks: ScheduledDelegate[] = [];

  #clock: IClock | null = null;

  get #currentTime() {
    return this.#clock?.currentTime ?? 0;
  }

  get hasPendingTasks(): boolean {
    return this.totalPendingTasks > 0;
  }

  get totalTasksRun(): number {
    return this.#totalTasksRun;
  }

  #totalTasksRun: number = 0;

  get totalPendingTasks(): number {
    return this.#runQueue.length + this.#timedTasks.length + this.#perUpdateTasks.length;
  }

  constructor(clock: IClock | null = new StopwatchClock()) {
    this.#clock = clock;
  }

  updateClock(newClock: IClock) {
    if (newClock === this.#clock)
      return;

    if (this.#clock === null) {
      // This is the first time we will get a valid time, so assume this is the
      // reference point everything scheduled so far starts from.
      for (const s of this.#timedTasks) {
        s.executionTime += newClock.currentTime;
      }
    }

    this.#clock = newClock;
  }

  readonly #tasksToSchedule: ScheduledDelegate[] = [];

  readonly #tasksToRemove: ScheduledDelegate[] = [];

  update(): number {
    this.#queueTimedTasks();
    this.#queuePerUpdateTasks();

    const countToRun = this.#runQueue.length;

    let countRun = 0;

    let task = this.#getNextTask();
    while (task) {
      task.runTaskInternal();

      this.#totalTasksRun++;

      task = this.#getNextTask();

      if (++countRun === countToRun)
        break;
    }

    return countRun;
  }

  #queueTimedTasks() {
    if (this.#timedTasks.length !== 0) {
      const currentTimeLocal = this.#currentTime;

      for (const sd of this.#timedTasks) {
        if (sd.executionTime <= currentTimeLocal) {
          this.#tasksToRemove.push(sd);

          if (sd.cancelled)
            continue;

          if (sd.repeatInterval === 0) {
            // handling of every-frame tasks is slightly different to reduce overhead.
            this.#perUpdateTasks.push(sd);
            continue;
          }

          if (sd.repeatInterval > 0) {
            // if (this.#timedTasks.length > LOG_EXCESSSIVE_QUEUE_LENGTH_INTERVAL)
            //   throw new ArgumentException("Too many timed tasks are in the queue!");

            sd.setNextExecution(currentTimeLocal);
            this.#tasksToSchedule.push(sd);
          }

          if (!sd.completed)
            this.#enqueue(sd);
        }
      }

      for (const t of this.#tasksToRemove) {
        const index = this.#timedTasks.indexOf(t);
        this.#timedTasks.splice(index, 1);
      }

      this.#tasksToRemove.length = 0;

      for (const t of this.#tasksToSchedule) {
        this.#timedTasks.push(t);
      }

      this.#tasksToSchedule.length = 0;
    }
  }

  #queuePerUpdateTasks() {
    if (this.#perUpdateTasks.length > 0) {
      for (let i = 0; i < this.#perUpdateTasks.length; i++) {
        const task = this.#perUpdateTasks[i];

        task.setNextExecution(null);

        if (task.cancelled) {
          this.#perUpdateTasks.splice(i--, 1);
          continue;
        }

        this.#enqueue(task);
      }
    }
  }

  #getNextTask(): ScheduledDelegate | null {
    return this.#runQueue.shift() ?? null;
  }

  cancelDelayedTasks() {
    for (const t of this.#timedTasks) {
      t.cancel();
    }

    this.#timedTasks.length = 0;
  }

  add<T>(task: (() => void) | ScheduledDelegate, receiver?: T, forceScheduled = true): ScheduledDelegate | null {
    if (task instanceof ScheduledDelegate) {
      if (task.completed) {
        throw new Error('Task has already been completed');
      }

      this.#timedTasks.push(task);

      return task;
    }

    if (!forceScheduled) {
      // We are on the main thread already - don't need to schedule.
      task();
      return null;
    }

    const del = new ScheduledDelegate(task);

    del.receiver = receiver;

    this.#enqueue(del);

    return del;
  }

  addDelayed(task: () => void, timeUntilRun: number, repeat: boolean = false) {
    const del = new ScheduledDelegate(task, this.#currentTime + timeUntilRun, repeat ? timeUntilRun : -1);
    this.add(del);
    return del;
  }

  addOnce<T>(task: () => void, receiver?: T): boolean {
    const existing = this.#runQueue.find(sd => sd.task === task);

    if (existing) {
      return false;
    }

    const sd = new ScheduledDelegate(task);
    sd.receiver = receiver;

    this.#enqueue(sd);

    return true;
  }

  #enqueue(task: ScheduledDelegate) {
    this.#runQueue.push(task);
  }
}
