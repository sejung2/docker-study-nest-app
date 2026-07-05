import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateNoteDto, Note, UpdateNoteDto } from '../notes/note.dto';
import { CreateWorkoutDto, UpdateWorkoutDto, WorkoutCheck } from '../workouts/workout.dto';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DB_CONNECTION, DB_POOL } from './database.provider';
import * as schema from './schema';

type NoteRecord = typeof schema.notes.$inferSelect;
type WorkoutRecord = typeof schema.workouts.$inferSelect;

function toNote(record: NoteRecord): Note {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    createdAt: record.createdAt,
  };
}

function toWorkout(record: WorkoutRecord): WorkoutCheck {
  return {
    id: record.id,
    workoutType: record.workoutType as WorkoutCheck['workoutType'],
    bodyParts: record.bodyParts as WorkoutCheck['bodyParts'],
    date: record.date,
    createdAt: record.createdAt,
  };
}

function getTodayDate(now: Date): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(DB_POOL) private readonly pool: Pool,
    @Inject(DB_CONNECTION) readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id text PRIMARY KEY,
        title text NOT NULL,
        content text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id text PRIMARY KEY,
        workout_type text NOT NULL,
        body_parts text[] NOT NULL DEFAULT '{}'::text[],
        workout_date date NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT workouts_unique_per_day UNIQUE (workout_date, workout_type)
      );
    `);

    this.logger.log('PostgreSQL schema is ready');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findAllNotes(): Promise<Note[]> {
    const records = await this.db
      .select()
      .from(schema.notes)
      .orderBy(asc(schema.notes.createdAt), asc(schema.notes.id));
    return records.map(toNote);
  }

  async findNoteById(id: string): Promise<Note> {
    const [note] = await this.db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.id, id))
      .limit(1);

    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    return toNote(note);
  }

  async createNote(dto: CreateNoteDto): Promise<Note> {
    const [created] = await this.db
      .insert(schema.notes)
      .values({
        id: uuidv7(),
        title: dto.title,
        content: dto.content,
      })
      .returning();

    return toNote(created);
  }

  async updateNote(id: string, dto: UpdateNoteDto): Promise<Note> {
    const [updated] = await this.db
      .update(schema.notes)
      .set({
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
      })
      .where(eq(schema.notes.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    return toNote(updated);
  }

  async deleteNote(id: string): Promise<void> {
    const [deleted] = await this.db.delete(schema.notes).where(eq(schema.notes.id, id)).returning({
      id: schema.notes.id,
    });

    if (!deleted) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
  }

  async findAllWorkouts(): Promise<WorkoutCheck[]> {
    const records = await this.db
      .select()
      .from(schema.workouts)
      .orderBy(asc(schema.workouts.createdAt), asc(schema.workouts.id));

    return records.map(toWorkout);
  }

  async createWorkout(dto: CreateWorkoutDto): Promise<WorkoutCheck> {
    const dateStr = getTodayDate(new Date());

    const [duplicate] = await this.db
      .select({ id: schema.workouts.id })
      .from(schema.workouts)
      .where(
        and(eq(schema.workouts.date, dateStr), eq(schema.workouts.workoutType, dto.workoutType)),
      )
      .limit(1);

    if (duplicate) {
      throw new ConflictException('오늘 이미 기록된 운동 종류입니다');
    }

    const [created] = await this.db
      .insert(schema.workouts)
      .values({
        id: uuidv7(),
        workoutType: dto.workoutType,
        bodyParts: dto.bodyParts ?? [],
        date: dateStr,
      })
      .returning();

    return toWorkout(created);
  }

  async updateWorkout(id: string, dto: UpdateWorkoutDto): Promise<WorkoutCheck> {
    const [current] = await this.db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.id, id))
      .limit(1);

    if (!current) {
      throw new NotFoundException(`Workout with id ${id} not found`);
    }

    const nextWorkoutType = dto.workoutType ?? current.workoutType;
    const nextBodyParts = nextWorkoutType === 'SPORTS' ? [] : (dto.bodyParts ?? current.bodyParts);

    const [updated] = await this.db
      .update(schema.workouts)
      .set({
        ...(dto.workoutType !== undefined ? { workoutType: dto.workoutType } : {}),
        bodyParts: nextBodyParts,
      })
      .where(eq(schema.workouts.id, id))
      .returning();

    return toWorkout(updated);
  }

  async deleteWorkout(id: string): Promise<void> {
    const [deleted] = await this.db
      .delete(schema.workouts)
      .where(eq(schema.workouts.id, id))
      .returning({
        id: schema.workouts.id,
      });

    if (!deleted) {
      throw new NotFoundException(`Workout with id ${id} not found`);
    }
  }
}
