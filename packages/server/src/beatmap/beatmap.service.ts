import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MapsetEntity} from "./mapset.entity";
import {Repository} from "typeorm";
import {BeatmapAccess, BeatmapEntity} from "./beatmap.entity";
import {createReadStream, existsSync} from "fs";
import * as path from "path";
import {ParticipantEntity} from "./participant.entity";
import {BeatmapData, Mapset} from "@osucad/common/dist";
import {ReadStream} from "typeorm/browser/platform/BrowserPlatformTools";
import {UserEntity} from "../users/user.entity";
import {EditorSessionEntity} from "../editor/editor-session.entity";

@Injectable()
export class BeatmapService {

  constructor(
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(EditorSessionEntity)
    private readonly sessionRepository: Repository<EditorSessionEntity>,
  ) {
  }

  async createMapset(mapset: MapsetEntity) {
    mapset = await this.mapsetRepository.save(mapset);
    for (const beatmap of mapset.beatmaps) {
      beatmap.mapset = mapset;
      await this.beatmapRepository.save(beatmap);
    }

    return mapset;
  }

  async findMapsetById(id: string) {
    return await this.mapsetRepository.findOne({
      where: { id },
      relations: [
        "creator",
        "beatmaps",
      ],
    });
  }

  async findBeatmapById(id: number) {
    return await this.beatmapRepository.findOne({
      where: { id },
      relations: [
        "mapset",
      ],
    });
  }

  async findBeatmapByUuid(uuid: string) {
    return await this.beatmapRepository.findOne({
      where: { uuid },
      relations: [
        "mapset",
      ],
    });
  }

  async mapsetExists(id: string) {
    return await this.mapsetRepository.exist({
      where: {
        id,
      },
    });
  }

  getFileStream(id: string, filePath: string) {
    filePath = path.join("files/mapsets", id, filePath);
    if (!existsSync(filePath)) return null;

    const relative = path.relative("files/mapsets", filePath);
    if (relative.startsWith("..") || path.isAbsolute(filePath)) return null;

    return createReadStream(filePath);
  }

  findMapsetsByCreator(id: number) {
    return this.mapsetRepository.find({
      where: {
        creator: { id },
      },
      relations: [
        "creator",
        "beatmaps",
      ],
      order: {
        updatedAt: "DESC",
      },
    });
  }

  async getAccessType(userId: number, mapsetId: string): Promise<BeatmapAccess> {
    const { access } = await this.mapsetRepository.findOneOrFail({
      where: { id: mapsetId },
      select: ["access"],
    });

    const participant = await this.participantRepository.findOne({
      where: {
        mapset: { id: mapsetId },
        user: { id: userId },
      },
    });

    return Math.max(access, participant?.access ?? 0);
  }

  async save(beatmap: BeatmapEntity, data: BeatmapData) {
    beatmap.data = data;
    await this.beatmapRepository.save(beatmap);
  }

  findLastEditedBeatmaps(user: UserEntity) {
    return this.sessionRepository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.beatmap", "beatmap")
      .innerJoinAndSelect("beatmap.mapset", "mapset")
      .innerJoinAndSelect("mapset.creator", "creator")
      .where({ user })
      .distinctOn(["beatmap.id"])
      .orderBy("session.endDate", "DESC")
      .limit(10)
      .getMany();
  }

}
