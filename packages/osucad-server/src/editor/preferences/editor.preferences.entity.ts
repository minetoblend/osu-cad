import { IPreferences } from '@osucad/common';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { z } from 'zod';

@Entity()
export class EditorPreferences implements IPreferences {
  @PrimaryColumn()
  userId: number;

  @Column({ default: 1 })
  volume: number;
}

function expectType<T>(_: T) {
  /* noop */
}

export const preferencesSchema = z.object({
  volume: z.number().min(0).max(1),
});

expectType<IPreferences>({} as z.infer<typeof preferencesSchema>);
