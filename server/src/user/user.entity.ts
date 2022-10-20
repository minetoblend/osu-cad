import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {Exclude} from "class-transformer";


@Entity('av_user')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    profileId: number;

    @Column()
    displayName: string;

    @Column({nullable: true})
    avatarUrl?: string

    @Column({nullable: true})
    @Exclude()
    accessToken?: string;

    @Column({nullable: true})
    @Exclude()
    refreshToken?: string;

}