import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../db/database.service';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: DatabaseService,
          useValue: {
            findAllNotes: jest.fn(),
            findNoteById: jest.fn(),
            createNote: jest.fn(),
            updateNote: jest.fn(),
            deleteNote: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
