import { ComposeScreenCommand } from "./command";

export class DeleteHitObjectCommand extends ComposeScreenCommand {
  id: string = "hitobject.delete";
  name: string = "Delete Selection";

  apply(): void {
    this.selection.selectedHitObjects.forEach((hitObject) => {
      this.hitObjects.remove(hitObject);
    });
  }
}
