import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkoutDto, UpdateWorkoutDto, WorkoutCheck, WorkoutType } from './workout.dto';

@Injectable()
export class WorkoutsService {
  private readonly workouts: WorkoutCheck[] = [];
  private idCounter = 1;

  findAll(): WorkoutCheck[] {
    return this.workouts;
  }

  create(dto: CreateWorkoutDto): WorkoutCheck {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const duplicate = this.workouts.find(
      (w) => w.date === dateStr && w.workoutType === dto.workoutType,
    );
    if (duplicate) {
      throw new ConflictException('오늘 이미 기록된 운동 종류입니다');
    }

    const newWorkout: WorkoutCheck = {
      id: this.idCounter++,
      workoutType: dto.workoutType,
      bodyParts: dto.bodyParts ?? [],
      date: dateStr,
      createdAt: now,
    };

    this.workouts.push(newWorkout);
    return newWorkout;
  }

  update(id: number, dto: UpdateWorkoutDto): WorkoutCheck {
    const workout = this.workouts.find((w) => w.id === id);
    if (!workout) {
      throw new NotFoundException(`Workout with id ${id} not found`);
    }
    if (dto.workoutType !== undefined) {
      workout.workoutType = dto.workoutType;
    }
    if (dto.bodyParts !== undefined) {
      workout.bodyParts = dto.bodyParts;
    }
    if (workout.workoutType === WorkoutType.SPORTS) {
      workout.bodyParts = [];
    }
    return workout;
  }

  delete(id: number): void {
    const index = this.workouts.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new NotFoundException(`Workout with id ${id} not found`);
    }
    this.workouts.splice(index, 1);
  }
}
