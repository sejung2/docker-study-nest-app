export enum WorkoutType {
  GYM = 'GYM',
  SPORTS = 'SPORTS',
}

export enum BodyPart {
  CHEST = 'CHEST',
  BACK = 'BACK',
  LEGS = 'LEGS',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
}

export class CreateWorkoutDto {
  workoutType!: WorkoutType;
  bodyParts?: BodyPart[];
}

export class UpdateWorkoutDto {
  workoutType?: WorkoutType;
  bodyParts?: BodyPart[];
}

export interface WorkoutCheck {
  id: number;
  workoutType: WorkoutType;
  bodyParts: BodyPart[];
  date: string;
  createdAt: Date;
}
