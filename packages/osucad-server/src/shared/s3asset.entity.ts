import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class S3Asset {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn()
  bucket: string;

  @Column()
  fileSize: number;
}
