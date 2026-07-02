import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './workout.dto';

@Controller('api/v1/workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  getAllWorkouts() {
    return this.workoutsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWorkout(@Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(dto);
  }
}
