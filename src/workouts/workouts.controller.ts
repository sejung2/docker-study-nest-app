import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './workout.dto';

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

  @Patch(':id')
  updateWorkout(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkoutDto) {
    return this.workoutsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWorkout(@Param('id', ParseIntPipe) id: number) {
    return this.workoutsService.delete(id);
  }
}
