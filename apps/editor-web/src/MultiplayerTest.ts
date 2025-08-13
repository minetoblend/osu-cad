import { EditorRuntime } from "@osucad/editor";
import type { Bindable, DragEndEvent, DragEvent, DragStartEvent } from "@osucad/framework";
import { asyncDependencyLoader, Axes, Box, CompositeDrawable, FillDirection, FillFlowContainer, Screen, SpriteText, Vec2 } from "@osucad/framework";
import { Delta } from "@osucad/multiplayer-core";
import type { HitCircle } from "@osucad/ruleset-osu";
import { queue } from "async";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export class MultiplayerTest extends Screen
{
  socket!: Socket;
  clientId!: number;
  runtime!: EditorRuntime;

  queue = queue(async ({ clientId, deltas }) =>
  {
    const local = clientId === this.clientId;
    for (const delta of deltas)
      this.runtime.process(delta.targetId, delta.content, local);
  });

  buffer: any[] = [];

  @asyncDependencyLoader()
  async #load()
  {
    this.queue.pause();

    const socket = this.socket = io("/", { transports: ["websocket"] });

    socket.onAny(console.log);

    await new Promise<void>((resolve, reject) =>
    {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });

    socket.on("delta", (clientId, deltas) => this.queue.push({ clientId, deltas }));

    const { summary, clientId } = await new Promise<any>(resolve => socket.once("init", resolve));

    this.clientId = clientId;

    const runtime = this.runtime = new EditorRuntime();

    runtime.on("deltaSubmitted", (dds, delta) =>
    {
      this.buffer.push({ targetId: dds.id!, content: Delta.encode(delta) });
    });

    await runtime.load(summary);
    this.queue.resume();

    this.addInternal(new MovableBox(runtime.root.hitObjects.hitObjects[0] as HitCircle, runtime));

    this.addInternal(new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      padding: 10,
      spacing: new Vec2(10),
      direction: FillDirection.Horizontal,
      children: [
        new Button("Undo", this.runtime.history.canUndoBindable, () => this.runtime.history.undo()),
        new Button("Redo", this.runtime.history.canRedoBindable, () => this.runtime.history.redo()),
      ],
    }));
  }

  override update()
  {
    super.update();

    if (this.buffer.length > 0)
    {
      this.socket.emit("delta", this.buffer);
      this.buffer = [];
    }
  }
}

class Button extends CompositeDrawable
{
  constructor(text: string, readonly enabled: Bindable<boolean>, readonly action: () => void)
  {
    super();

    this.autoSizeAxes = Axes.Both;
    this.masking = true;
    this.cornerRadius = 5;
    this.internalChildren = [
      new Box({ relativeSizeAxes: Axes.Both, color: 0x222228 }),
      new SpriteText({
        text,
        margin: { horizontal: 20, vertical: 5 },
        style: {
          fill: 0xffffff,
        },
      }),
    ];

    enabled.bindValueChanged(e => this.alpha = e.value ? 1 : 0.5, true);
  }

  override onClick()
  {
    this.action();
    return true;
  }
}

class MovableBox extends CompositeDrawable
{
  constructor(readonly object: HitCircle, readonly runtime: EditorRuntime)
  {
    super();

    this.positionBindable = object.positionBindable.getBoundCopy();

    this.size = new Vec2(100);
    this.internalChild = new Box({ relativeSizeAxes: Axes.Both });
  }

  positionBindable!: Bindable<Vec2>;

  protected override loadComplete()
  {
    super.loadComplete();

    this.positionBindable.bindValueChanged(pos => this.position = pos.value, true);
  }

  override onDragStart(e: DragStartEvent): boolean
  {
    return true;
  }

  override onDrag(ev: DragEvent): boolean
  {
    this.object.moveBy(ev.delta.x, ev.delta.y);

    return true;
  }

  override onDragEnd(ev: DragEndEvent)
  {
    this.runtime.history.commit();
  }
}
