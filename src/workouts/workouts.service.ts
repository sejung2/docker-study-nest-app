import { ConflictException, Injectable } from '@nestjs/common';
import { CreateWorkoutDto, WorkoutCheck } from './workout.dto';

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
      date: `${yyyy}-${mm}-${dd}`,
      createdAt: now,
    };

    this.workouts.push(newWorkout);
    return newWorkout;
  }
}
