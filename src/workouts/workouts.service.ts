import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { CreateWorkoutDto, UpdateWorkoutDto, WorkoutCheck } from './workout.dto';

type WorkoutDatabase = {
  findAllWorkouts(): Promise<WorkoutCheck[]>;
  createWorkout(dto: CreateWorkoutDto): Promise<WorkoutCheck>;
  updateWorkout(id: string, dto: UpdateWorkoutDto): Promise<WorkoutCheck>;
  deleteWorkout(id: string): Promise<void>;
};

@Injectable()
export class WorkoutsService {
  constructor(private readonly database: DatabaseService) {}

  findAll(): Promise<WorkoutCheck[]> {
    return (this.database as unknown as WorkoutDatabase).findAllWorkouts();
  }

  create(dto: CreateWorkoutDto): Promise<WorkoutCheck> {
    return (this.database as unknown as WorkoutDatabase).createWorkout(dto);
  }

  update(id: string, dto: UpdateWorkoutDto): Promise<WorkoutCheck> {
    return (this.database as unknown as WorkoutDatabase).updateWorkout(id, dto);
  }

  delete(id: string): Promise<void> {
    return (this.database as unknown as WorkoutDatabase).deleteWorkout(id);
  }
}
