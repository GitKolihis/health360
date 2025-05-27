/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum } from 'class-validator';
import { TaskStatus } from '../enum/tasksEnum.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, {
    message: 'Status must be a valid TaskStatus enum value',
  })
  status: TaskStatus;
}
