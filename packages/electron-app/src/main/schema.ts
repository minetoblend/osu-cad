import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const mapsets = sqliteTable('mapset', {
  id: integer('id').primaryKey(),
  type: text('type', { enum: ['osucad', 'osu-stable'] }),
});
