import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../user/user.entity";

@Entity()
export class BeatmapSet {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToMany(() => Beatmap, beatmap => beatmap.mapSet)
    difficulties: Beatmap[]

    @ManyToOne(() => User, {eager: true})
    owner: User

    @Column('text')
    title
        :
        string = ''

    @Column('text')
    titleUnicode
        :
        string = ''

    @Column('text')
    artist
        :
        string = ''

    @Column('text')
    artistUnicode
        :
        string = ''

    @Column('int', {nullable: true})
    mapSetId ?: number

}


@Entity()
export class Beatmap {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => BeatmapSet, {nullable: false})
    mapSet: BeatmapSet;

    @Column()
    difficultyName: string

    @Column('json')
    beatmapData: Record<string, any>

    @Column({nullable: true})
    backgroundFilename?: string

}