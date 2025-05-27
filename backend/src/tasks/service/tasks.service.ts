/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v6 as uuidv6 } from 'uuid';
import * as fs from 'fs-extra';
import { join } from 'path';
import { Task } from '../entity/task.entity';
import { TaskStatus } from '../enum/tasksEnum.enum';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/updateTaskStatus.dto';

@Injectable()
export class TasksService {
  private readonly filePath = join(process.cwd(), 'data', 'tasks.json');

  constructor() {
    this.ensureDataFileExists();
  }

  async ensureDataFileExists(): Promise<void> {
    try {
      await fs.ensureFile(this.filePath);
      const data = await fs.readFile(this.filePath, 'utf8');
      if (!data) {
        await fs.writeJSON(this.filePath, []);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to initialize tasks data file',
      );
    }
  }

  private async readTasks(): Promise<Task[]> {
    try {
      return await fs.readJSON(this.filePath);
    } catch (error) {
      throw new InternalServerErrorException('Failed to read tasks data');
    }
  }

  private async writeTasks(tasks: Task[]): Promise<void> {
    try {
      await fs.writeJSON(this.filePath, tasks);
    } catch (error) {
      throw new InternalServerErrorException('Failed to save tasks data');
    }
  }

  async getAllTasks(): Promise<Task[]> {
    return this.readTasks();
  }

  async getTaskById(id: string): Promise<Task> {
    const tasks = await this.readTasks();
    const found = tasks.find((task) => task.id === id);
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const tasks = await this.readTasks();
    const { title, description } = createTaskDto;
    const newId = uuidv6();
    const task: Task = {
      id: newId,
      title,
      description,
      status: TaskStatus.OPEN,
      createdAt: new Date(),
    };
    tasks.push(task);
    await this.writeTasks(tasks);
    return task;
  }

  async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const updatedTask = {
      ...tasks[taskIndex],
      status: updateTaskStatusDto.status,
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    await this.writeTasks(tasks);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    // Remove the task from the array
    tasks.splice(taskIndex, 1);
    // Write the updated tasks back to the file
    await this.writeTasks(tasks);
  }
}
