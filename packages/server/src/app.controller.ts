import { Controller, Get, Header } from "@nestjs/common";
import { readFileSync } from "fs";
import { resolveClientPath } from "./utils/resolve-path";

@Controller()
export class AppController {
  constructor() {}

  @Get(["/", "edit/:id"])
  @Header("Content-Type", "text/html")
  async renderApp(): Promise<string> {
    return readFileSync(resolveClientPath("dist", "index.html"), {
      encoding: "utf-8",
    });
  }
}
