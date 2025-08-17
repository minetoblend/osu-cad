import { Axes, CompositeDrawable, dependencyLoader, Interpolation, resolved } from "@osucad/framework";
import type { ISelf } from "@osucad/multiplayer-client";
import type { Signaler } from "@osucad/multiplayer-core";
import type { IClient } from "@osucad/multiplayer-protocol";
import { IAudience } from "../../injectionTokens";
import { EditorBeatmap } from "../../runtime";
import { HitObjectComposer } from "../HitObjectComposer";
import { ActiveToolBindable } from "./ActiveToolBindable";
import type { ComposeToolPresenceOverlay } from "./ComposeToolPresenceOverlay";
import { EditorClock } from "../../EditorClock";

export interface IToolPresence
{
  tool: string
  currentTime: number
  details: unknown
}

export class ComposePresenceContainer extends CompositeDrawable
{
  @resolved(IAudience)
  accessor #audience!: IAudience;

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(ActiveToolBindable)
  accessor #activeTool!: ActiveToolBindable

  @resolved(() => HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  @resolved(() => EditorClock)
  accessor #editorClock!: EditorClock;

  #signaler!: Signaler;

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;

    for (const client of this.#audience.getMembers().values())
      this.#memberAdded(client);

    this.#audience.on("addMember", this.#memberAdded, this);
    this.#audience.on("removeMember", this.#memberRemoved, this);
    this.#audience.on("selfChanged", this.#selfChanged, this);

    this.#signaler = this.#beatmap.signals;
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.#sendOwnPresence(), 50, true);

    this.#signaler.on("compose:presence", (content, clientId) =>
    {
      const drawable = this.#drawables.get(clientId);
      if (!drawable)
        return;

      drawable.updatePresence(content as IToolPresence);
    });
  }


  readonly #drawables= new Map<string, ComposeUserPresenceContainer>();

  #selfChanged(self: ISelf)
  {
    this.#removeOverlay(self.clientId);
  }

  #memberAdded(client: IClient)
  {
    if (this.#audience.getSelf()?.clientId === client.clientId)
      return;

    const container = new ComposeUserPresenceContainer(client);
    this.#drawables.set(client.clientId, container);
    this.addInternal(container);
  }

  #memberRemoved(client: IClient)
  {
    this.#removeOverlay(client.clientId);
  }

  #removeOverlay(clientId: string)
  {
    const drawable = this.#drawables.get(clientId);
    if (drawable)
    {
      drawable.expire();
      this.#drawables.delete(clientId);
    }
  }

  #sendOwnPresence()
  {
    if (this.#audience.getMembers().size === 1)
      return;

    const tool = this.#composer.composeToolContainer.activeTool;
    if (!this.#activeTool.value || !tool)
      return;

    const id = this.#activeTool.value.id;

    const presence: IToolPresence =  {
      tool: id,
      currentTime: this.#editorClock.currentTime,
      details: tool.getPresence(),
    };

    this.#signaler.send("compose:presence", presence);
  }
}

class ComposeUserPresenceContainer extends CompositeDrawable
{
  constructor(readonly client: IClient)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(() => HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  @resolved(() => EditorClock)
  accessor #editorClock!: EditorClock;

  #currentToolId?: string;
  #currentOverlay?: ComposeToolPresenceOverlay;

  updatePresence(presence: IToolPresence)
  {
    if (presence.tool !== this.#currentToolId)
    {
      this.#currentOverlay?.expire();
      this.#currentOverlay = undefined;

      this.#currentToolId = presence.tool;

      const tool = this.#composer.tools.find(it => it.id === presence.tool);

      if (tool?.presenceOverlay)
      {
        this.addInternal(this.#currentOverlay = new tool.presenceOverlay());
      }
    }

    const timeDifference = Math.abs(this.#editorClock.currentTime - presence.currentTime);

    const targetAlpha = Interpolation.valueAt(timeDifference, 1, 0, 1000, 2000);

    this.fadeTo(targetAlpha, 300);

    if (this.isPresent)
      this.#currentOverlay?.updatePresence(presence.details);
  }
}
