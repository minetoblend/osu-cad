import {Controller, Get, Header, Req} from '@nestjs/common';
import {Request} from "express";
import {readFileSync} from "fs";
import {resolveClientPath} from "./utils/resolve-path";

const TEMPLATE_PLACEHOLDER = '<!--ssr-outlet-->';

@Controller()
export class AppController {
  constructor() {
  }

  @Get([
    '/',
    'edit/:id',
  ])
  @Header('Content-Type', 'text/html')
  async renderApp(@Req() request: Request): Promise<string> {
    return readFileSync(resolveClientPath('dist', 'index.html'), {
      encoding: 'utf-8',
    });
  }
}
