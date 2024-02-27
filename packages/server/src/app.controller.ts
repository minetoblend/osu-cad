import { Controller, Get, Header, Req } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolveClientPath } from './utils/resolve-path';
import { Request } from 'express';
import { UserInfo } from '@osucad/common';

@Controller()
export class AppController {
  constructor() {}

  private indexHtml?: string;

  @Get(['/', 'edit/:id', 'users/:id', 'admin*'])
  @Header('Content-Type', 'text/html')
  async renderApp(@Req() req: Request): Promise<string> {
    let user: string = 'null';

    if (req.session.user) {
      const userInfo: UserInfo = {
        id: req.session.user.id,
        username: req.session.user.username,
        avatarUrl: req.session.user.avatarUrl,
        isAdmin: req.session.user.isAdmin,
        created: req.session.user.created as unknown as string,
        links: {
          self: {
            href: `/api/users/${req.session.user.id}`,
          },
          profile: {
            href: `/users/${req.session.user.id}`,
          },
        },
      };
      user = JSON.stringify(userInfo);
    }

    this.indexHtml ??= readFileSync(resolveClientPath('dist', 'index.html'), {
      encoding: 'utf-8',
    });

    return this.indexHtml.replace(
      '<!-- user -->',
      `<script id="user-json" type="application/json">${user}</script>`,
    );
  }
}
