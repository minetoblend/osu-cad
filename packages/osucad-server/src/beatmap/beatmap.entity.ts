import {
  IDocumentSnapshot,
  IMapSnapshotData,
  IObjectSnapshot,
  ISortedCollectionSnapshotData,
} from '@osucad/unison';
import ShortUniqueId from 'short-unique-id';
import { SharedAsset } from 'src/shared/shared.asset.entity';
import { User } from 'src/users/user.entity';
import {
  PrimaryColumn,
  Entity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

const uid = new ShortUniqueId({ length: 10 });

class Difficulty {
  @Column('float', { default: 5 })
  hpDrainRate: number;

  @Column('float', { default: 4 })
  circleSize: number;

  @Column('float', { default: 8.5 })
  approachRate: number;

  @Column('float', { default: 8.5 })
  overallDifficulty: number;

  @Column('float', { default: 1.4 })
  sliderMultiplier: number;
}

@Entity()
export class Beatmap {
  @PrimaryColumn()
  id: string = uid();

  @Column()
  titleUnicode: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  artistUnicode: string;

  @Column({ nullable: true })
  artist: string;

  @ManyToOne(() => SharedAsset, { eager: true })
  audio: SharedAsset;

  @ManyToOne(() => User, { eager: true })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: false })
  deleted: boolean;

  @Column('json', { nullable: true })
  data?: IObjectSnapshot<IDocumentSnapshot>;

  @Column('json', { nullable: true })
  hitObjects?: IObjectSnapshot<ISortedCollectionSnapshotData>;

  @Column('json', { nullable: true })
  timing?: IObjectSnapshot<ISortedCollectionSnapshotData>;

  @Column('json', { nullable: true })
  colors?: IObjectSnapshot<IMapSnapshotData>;

  // Difficulty

  @Column(() => Difficulty)
  difficulty: Difficulty = new Difficulty();
}
