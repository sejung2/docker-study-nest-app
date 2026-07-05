import { date, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workouts = pgTable(
  'workouts',
  {
    id: text('id').primaryKey(),
    workoutType: text('workout_type').notNull(),
    bodyParts: text('body_parts').array().notNull(),
    date: date('workout_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workoutsUniquePerDay: uniqueIndex('workouts_unique_per_day').on(table.date, table.workoutType),
  }),
);
