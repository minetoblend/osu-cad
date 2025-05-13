import type { DependencyContainer, IFrameBasedClock, IInput, PassThroughInputManager, ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, Component, Interpolation, MousePositionAbsoluteInput, Vec2 } from "@osucad/framework";
import replayUrl from "./replay.osr?url";
import { ScoreDecoder } from "osu-parsers";
import type { LegacyReplayFrame, Replay } from "osu-classes";
import type { DrawableRuleset, Playfield } from "@osucad/core";
import { PlayfieldClock, ReplayState } from "@osucad/core";
import { OsuAction } from "@osucad/ruleset-osu";
import { ReplayClock } from "./ReplayClock";

export class ReplayPlayer extends Component
{
  constructor(
    readonly drawableRuleset: DrawableRuleset,
    readonly playfield: Playfield,
  )
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.inputManager = drawableRuleset.keybindingInputManager;
  }

  inputManager!: PassThroughInputManager;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer
  {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);
  }

  playfieldClock!: IFrameBasedClock;

  replayClock!: ReplayClock;

  protected override get hasAsyncLoader(): boolean
  {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void>
  {
    await super.loadAsync(dependencies);

    this.playfieldClock = dependencies.resolve(PlayfieldClock);

    this.replayClock = new ReplayClock(this.playfieldClock);

    this.clock = this.replayClock;

    this.#dependencies.provide(PlayfieldClock, this.replayClock);

    const replayData = await fetch(replayUrl).then(res => res.arrayBuffer());

    const decoder = new ScoreDecoder();
    const score = await decoder.decodeFromBuffer(replayData, true);
    this.replay = score.replay!;

    this.addInternal(this.drawableRuleset);
  }

  replay!: Replay;

  frameIndex = 0;
  lastFrameTime = 0;

  override get requiresChildrenUpdate(): boolean
  {
    return false;
  }

  protected isImportant(frame: LegacyReplayFrame, previous: LegacyReplayFrame)
  {
    return previous.mouseLeft !== frame.mouseLeft || previous.mouseRight !== frame.mouseRight;
  }

  override update()
  {
    super.update();


    if (!this.replay.frames[this.frameIndex] || this.replay.frames[this.frameIndex].startTime > this.playfieldClock.currentTime)
      this.frameIndex = 0;

    while (true)
    {
      const previous = this.replay.frames[this.frameIndex] as LegacyReplayFrame;
      const current = this.replay.frames[this.frameIndex + 1] as LegacyReplayFrame;
      const next = this.replay.frames[this.frameIndex + 2] as LegacyReplayFrame;

      if (!current)
        return;

      if (this.playfieldClock.currentTime < current.startTime)
        break;

      if (previous && next && this.isImportant(current, previous))
      {
        console.log("Simulating extra frame at ", current.startTime, ", currentTime: ", this.playfieldClock.currentTime);
        this.replayClock.processFrame(current.startTime);
        this.simulateFrame(current, next);
      }

      this.frameIndex++;
    }

    this.replayClock.processFrame();

    const frame = this.replay.frames[this.frameIndex] as LegacyReplayFrame;
    const next = this.replay.frames[this.frameIndex + 1]as LegacyReplayFrame;

    if (!frame || !next)
      return;

    this.simulateFrame(frame, next);
  }

  simulateFrame(frame: LegacyReplayFrame, nextFrame: LegacyReplayFrame)
  {
    for (const child of this.aliveInternalChildren)
      child.updateSubTree();

    const startPos = new Vec2(frame.mouseX, frame.mouseY);
    const endPos = new Vec2(nextFrame.mouseX, nextFrame.mouseY);

    const position = Interpolation.valueAt(this.time.current, startPos, endPos, frame.startTime, nextFrame.startTime);

    this.applyInput(new MousePositionAbsoluteInput(this.playfield.toScreenSpace(position)));

    const buttons: OsuAction[] = [];

    if (frame.mouseLeft)
      buttons.push(OsuAction.LeftButton);
    if (frame.mouseRight)
      buttons.push(OsuAction.RightButton);

    this.applyInput(new ReplayState(buttons));
  }

  applyInput(input: IInput)
  {
    input.apply(this.inputManager.currentState, this.inputManager);
  }
}
