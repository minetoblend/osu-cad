import ShortUniqueId from 'short-unique-id';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { S3Asset } from './s3asset.entity';
import { User } from 'src/users/user.entity';

const uid = new ShortUniqueId({ length: 10 });

export type SharedAssetType = 'beatmapAudio';

@Entity()
export class SharedAsset {
  @PrimaryColumn()
  id: string = uid();

  @ManyToOne(() => S3Asset, { eager: true })
  s3Asset: S3Asset;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  contentType: string;

  @Column()
  type: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  createdBy?: User;

  @CreateDateColumn()
  createdAt?: Date;
}
