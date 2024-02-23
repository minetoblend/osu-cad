import { deleteObjectsInteraction } from '../interaction/deleteObjects.ts';
import { Drawable } from '../drawables/Drawable.ts';
import { Inject } from '../drawables/di';
import { Vec2 } from '@osucad/common';
import { copyPasteInteractions } from '../interaction/copyPasteInteractions.ts';
import { transformHitObjectsInteraction } from '../interaction/mirrorHitObjects.ts';
import { reverseHitObjectsInteraction } from '../interaction/reverseHitObjects.ts';
import { bookmarkInteractions } from '../interaction/bookmarks.ts';
import { EditorContext } from '@/editor/editorContext.ts';
import { InjectionKey } from 'vue';
import { ScaleToFitContainer } from '@/editor/drawables/scaleToFitContainer.ts';

export const PlayfieldOverlay: InjectionKey<ScaleToFitContainer> =
  Symbol('PlayfieldOverlay');

export class ToolContainer extends Drawable {
  @Inject(EditorContext)
  editor!: EditorContext;

  @Inject(PlayfieldOverlay)
  playfieldOverlay!: ScaleToFitContainer;

  onLoad() {
    deleteObjectsInteraction(this.editor);
    copyPasteInteractions(this.editor);
    transformHitObjectsInteraction(this.editor);
    reverseHitObjectsInteraction(this.editor);
    bookmarkInteractions(this.editor);

    watch(
      () => this.editor.tools.activeTool,
      (tool, previousTool) => {
        if (previousTool) previousTool.destroy();
        this.removeChildren();
        this.playfieldOverlay.content.removeChildren();

        tool.mousePos = previousTool?.mousePos ?? new Vec2();
        this.addChild(tool);
        this.playfieldOverlay.content.addChild(tool.overlay);
      },
      { immediate: true },
    );
  }
}
