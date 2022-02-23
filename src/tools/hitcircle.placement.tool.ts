import { ReceiveHitObjectMouseEvents, ReceivePlayfieldMouseEvents, ToolWithOverlay } from "@/tools/tool";
import { OsuCadContainer, ResourceProvider } from "@/draw";
import { CirclePiece } from "@/draw/circle.piece";
import { OsuCadMouseEvent } from "@/components/screen/compose/playfield";
import { EditorContext } from "@/objects/Editor";
import { HitCircle } from "@/objects/HitCircle";
import { ToolManager } from "@/components/screen/compose/tool.manager";

export class HitcirclePlacementTool extends ToolWithOverlay<HitCirclePlacementOverlay> implements ReceivePlayfieldMouseEvents, ReceiveHitObjectMouseEvents {

  constructor(readonly context: EditorContext, resourceProvider: ResourceProvider, readonly toolManager: ToolManager) {
    super('place:hitcircle', 'Hitcircle', resourceProvider, new HitCirclePlacementOverlay(resourceProvider));
  }

  onPlayfieldMouseMove(evt: OsuCadMouseEvent) {
    this.overlay.circlePiece.position.set(
      evt.position.x,
      evt.position.y,
    )
  }

  onHitObjectMouseDown(evt: OsuCadMouseEvent) {
    if (evt.button === 2) {
      this.context.connector.removeHitObject(evt.hitObject!)
    } else if (evt.button === 0) {
      const hitObject = new HitCircle()
      hitObject.time = this.context.playback!.currentTime.value
      hitObject.position = evt.position.clone()
      this.context.connector.createHitCircle(hitObject)
    }
  }

  onPlayfieldMouseDown(evt: OsuCadMouseEvent) {
    if (evt.button === 2) {
      this.toolManager.selectTool('select')
      return
    }
    const hitObject = new HitCircle()
    hitObject.time = this.context.playback!.currentTime.value
    hitObject.position = evt.position.clone()
    this.context.connector.createHitCircle(hitObject)
  }

}

export class HitCirclePlacementOverlay extends OsuCadContainer {
  readonly circlePiece: CirclePiece;

  constructor(resourceProvider: ResourceProvider) {
    super(resourceProvider);
    this.circlePiece = new CirclePiece(resourceProvider)
    this.addChild(this.circlePiece)
  }
}