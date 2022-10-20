import {Injectable} from "@nestjs/common";
import {Migration, Migrator} from "../util/migration";
import {BeatmapSchema, BeatmapSchemaBase} from "./schema/beatmap.schema";
import {Beatmap} from "./beatmap.entity";


@Injectable()
export default class BeatmapMigrator extends Migrator<BeatmapSchemaBase, BeatmapSchema, Beatmap> {

    getMigrations(): Migration<BeatmapSchemaBase, BeatmapSchemaBase, Beatmap>[] {
        return [];
    }



}
