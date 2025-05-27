import { Component, EventEmitter, Output, inject, DestroyRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../task.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class TaskFormComponent {
  @Output() taskCreated = new EventEmitter<void>();
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  protected taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]]
  });

  protected onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { title, description } = this.taskForm.value;
    
    this.taskService.createTask({ title, description })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.taskCreated.emit();
          this.taskForm.reset();
        },
        error: (err) => {
          this.errorMessage.set('Failed to create task. Please try again.');
          // console.error('Task creation error:', err);
        }
      });
  }

  protected get title() {
    return this.taskForm.get('title');
  }

  protected get description() {
    return this.taskForm.get('description');
  }
}