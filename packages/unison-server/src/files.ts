import { Logger } from "@nestjs/common";
import { MessageTopic } from "./broadcast";
import { IClient } from "@osucad/unison";

export class FileHandler {
  readonly logger = new Logger(FileHandler.name);

  constructor(public topic: MessageTopic<IClient>) {
    this.close = this.topic.on((client, id: string, buffer: ArrayBuffer) => {
      this.logger.log(`Received file from ${client.clientId}`);
      console.log(buffer);
    });
  }

  uploadFile(client: IClient, file: File) {}

  close: () => void;
}
