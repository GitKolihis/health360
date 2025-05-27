import { Injectable, NotFoundException } from '@nestjs/common';
import { v6 as uuidv6 } from 'uuid';
import { Task } from '../entity/task.entity';
import { TaskStatus } from '../enum/tasksEnum.enum';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/updateTaskStatus.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task {
    const found = this.tasks.find((task) => task.id === id);
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const newId = uuidv6();
    const task: Task = {
      id: newId,
      title,
      description,
      status: TaskStatus.OPEN,
      createdAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Task {
    const { status } = updateTaskStatusDto;
    const task = this.getTaskById(id);
    task.status = status;
    task.updatedAt = new Date();
    return task;
  }

  deleteTask(id: string): void {
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter((task) => task.id !== found.id);
  }
}
