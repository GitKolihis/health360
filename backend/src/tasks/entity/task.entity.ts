import { TaskStatus } from '../enum/tasksEnum.enum';
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt?: Date;
}
