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
import { RoomInfo } from '@osucad/common';
import { UserService } from '../users/user.service';

@Controller('api/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly roomManager: EditorRoomService,
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
  getActiveRooms() {
    const rooms = this.roomManager.getActiveRooms();

    return rooms.map<RoomInfo>((room) => {
      const beatmap = room.entity;
      const mapset = room.entity.mapset;

      return {
        createdAt: room.createdAt,
        beatmap: {
          id: beatmap.uuid,
          name: beatmap.name,
          links: {
            thumbnail:
              (beatmap.thumbnailSmall && {
                href: `/api/beatmaps/${beatmap.uuid}/thumbnail/small`,
              }) ??
              null,
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
    });
  }
}
