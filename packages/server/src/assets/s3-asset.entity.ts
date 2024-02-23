import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('s3_assets')
export class S3AssetEntity {
  @PrimaryColumn({ type: 'varchar' })
  key: string;
  @Column({ type: 'varchar' })
  bucket: string;
  @Column({ type: 'int' })
  filesize: number;
  @Column({ type: 'int', default: 0 })
  refCount: number;
}
