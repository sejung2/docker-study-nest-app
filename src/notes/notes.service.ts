import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import type { CreateNoteDto, Note, UpdateNoteDto } from './note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(): Promise<Note[]> {
    return this.database.findAllNotes();
  }

  async findById(id: string): Promise<Note> {
    return this.database.findNoteById(id);
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    return this.database.createNote(dto);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    return this.database.updateNote(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.database.deleteNote(id);
  }
}
