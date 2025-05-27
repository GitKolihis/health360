import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../task.service';
import { Task, TaskStatus } from '../task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, FormsModule, TaskFormComponent]
})
export class TaskListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskService = inject(TaskService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly filteredTasks = signal<Task[]>([]);
  protected readonly selectedStatus = signal<TaskStatus | 'ALL'>('ALL');
  protected readonly statusOptions = ['ALL', ...Object.values(TaskStatus)] as const;
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadTasks();
  }

  protected loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.taskService.getTasks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.filterTasks();
        },
        error: (err) => {
          this.errorMessage.set('Failed to load tasks. Please try again later.');
          // console.error('Error loading tasks:', err);
        }
      });
  }

  protected filterTasks(): void {
    const status = this.selectedStatus();
    const allTasks = this.tasks() ?? [];

    this.filteredTasks.set(
      status === 'ALL'
        ? [...allTasks]
        : allTasks.filter(task => task.status === status)
    );
  }

  protected onStatusFilterChange(status: TaskStatus | 'ALL'): void {
    this.selectedStatus.set(status);
    this.filterTasks();
  }

  protected onStatusChange(taskId: string, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadTasks(),
        error: (err) => {
          this.errorMessage.set('Failed to update task status. Please try again.');
          // console.error('Error updating status:', err);
        }
      });
  }

  protected onDelete(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.loadTasks(),
          error: (err) => {
            this.errorMessage.set('Failed to delete task. Please try again.');
            // console.error('Error deleting task:', err);
          }
        });
    }
  }
}