import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IBeatmapEntity } from '../../types/IBeatmapManager';

@Entity('beatmap')
@Unique(['folderName', 'osuFileName'])
export class BeatmapEntity implements IBeatmapEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('boolean', { default: false })
  unparseable!: boolean;

  @Column('varchar', { length: 256 })
  folderName!: string;

  @Column('varchar', { length: 256 })
  osuFileName!: string;

  @Column('varchar', { length: 256, nullable: true })
  osucadFileName!: string | null;

  @Column('varchar', { length: 40 })
  sha1!: string;

  @Column('varchar', { length: 256 })
  artist!: string;

  @Column('varchar', { length: 256 })
  artistUnicode!: string;

  @Column('varchar', { length: 256 })
  title!: string;

  @Column('varchar', { length: 256 })
  titleUnicode!: string;

  @Column('varchar', { length: 256 })
  difficultyName!: string;

  @Column('varchar', { length: 512 })
  tags!: string;

  @Column('varchar', { length: 128 })
  creatorName!: string;

  @Column('varchar', { length: 256, nullable: true })
  backgroundFileName!: string | null;

  @Column('varchar', { length: 256, default: '' })
  audioFileName!: string;

  @Column('int')
  osuWebId!: number;

  @Column('int')
  osuWebMapsetId!: number;

  @Column('int')
  previewTime!: number;

  @Column('real', { default: 0 })
  starRating!: number;

  @Column('boolean', { default: true })
  needsStarRatingUpdate!: boolean;

  @Column('int', { default: 0 })
  lastModifiedDate!: number;

  @Column('boolean', { default: false })
  diffCalcInProgress!: boolean;
}
