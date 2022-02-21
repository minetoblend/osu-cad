import {OsuCadContainer, ResourceProvider} from "@/draw";
import {OsuCadMouseEvent, Playfield} from "@/components/screen/compose/playfield";

export abstract class Tool {

  protected constructor(readonly id: string, readonly name: string, readonly resourceProvider: ResourceProvider) {

  }
}

interface ToolSelectContext {
  playfield: Playfield
}

export interface Tool {
  onToolSelect?(ctx: ToolSelectContext): void

  onToolDeselect?(ctx: ToolSelectContext): void
}

export abstract class ToolWithOverlay<Overlay extends OsuCadContainer> extends Tool {

  protected constructor(id: string, name: string, resourceProvider: ResourceProvider, readonly overlay: Overlay) {
    super(id, name, resourceProvider);
  }

  onToolSelect(ctx: ToolSelectContext) {
    ctx.playfield.overlay = this.overlay
  }

  onToolDeselect(ctx: ToolSelectContext) {
    ctx.playfield.overlay = null
  }

}


export interface HitObjectMouseEvents {

  onHitObjectMouseDown?(): void

  onHitObjectMouseUp?(): void

  onHitObjectDragStart?(): void

  onHitObjectDrag?(): void

  onHitObjectDragEnd?(): void

  onHitObjectMouseMove?(): void
}

export interface ReceivePlayfieldMouseEvents {

  onPlayfieldMouseMove?(evt: OsuCadMouseEvent): void

  onPlayfieldMouseDown?(evt: OsuCadMouseEvent): void

}