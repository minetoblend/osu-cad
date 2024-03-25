import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin-auth.guard';
import { EditorRoomService } from '../editor/editor-room.service';
import { UserService } from '../users/user.service';
import { ImagesService } from '../assets/images.service';
import { AuditService } from '../audit/audit.service';

@Controller('api/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly roomManager: EditorRoomService,
    private readonly imagesService: ImagesService,
    private readonly auditService: AuditService,
  ) {}

  @Get('users')
  async getUsers(
    @Query() query: { search?: string; limit?: string; offset?: string },
  ) {
    const limit = parseInt(query.limit ?? '25');
    if (isNaN(limit)) throw new BadRequestException('Invalid limit');
    if (limit > 100)
      throw new BadRequestException('Limit cannot be greater than 100');

    const offset = parseInt(query.offset ?? '0');
    if (isNaN(offset)) throw new BadRequestException('Invalid offset');

    const search = query.search?.trim().toLowerCase();
    if (search !== undefined && search.length === 0)
      throw new BadRequestException('Search query cannot be empty');

    const users = await this.userService.searchUsers({ search, limit, offset });
    return users.map((user) => user.getInfo());
  }

  @Get('rooms')
  async getActiveRooms() {
    const rooms = this.roomManager.getActiveRooms();

    return Promise.all(
      rooms.map(async (room) => {
        const beatmap = room.entity;
        const mapset = room.entity.mapset;

        const thumbnail = this.imagesService.getImageUrl(
          beatmap.thumbnailId,
          'thumbnail',
        );

        return {
          createdAt: room.createdAt,
          beatmap: {
            id: beatmap.uuid,
            name: beatmap.name,
            links: {
              thumbnail: thumbnail
                ? {
                    href: thumbnail,
                  }
                : null,
              edit: {
                href: `/edit/${beatmap.shareId}`,
              },
            },
          },
          mapset: {
            id: mapset.id,
            artist: mapset.artist,
            title: mapset.title,
          },
          userCount: room.users.length,
          users: room.users.map((user) => user.getInfo()),
        };
      }),
    );
  }

  @Get('audit-events')
  async getAuditEvents(@Query('after') after?: number) {
    const events = await this.auditService.getEvents({ after });
    return events.map((event) => {
      return {
        id: event.id,
        user: event.user.getInfo(),
        action: event.action,
        details: event.details,
        timestamp: event.timestamp,
      };
    });
  }
}
