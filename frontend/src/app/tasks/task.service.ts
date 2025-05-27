import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Task, TaskStatus } from './task.model';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
  method?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/tasks';

  getTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(error => this.handleError('fetching tasks', error))
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(error => this.handleError(`fetching task ${id}`, error))
    );
  }

  createTask(task: { title: string; description?: string }): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, task).pipe(
      map(response => response.data),
      catchError(error => this.handleError('creating task', error))
    );
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(response => response.data),
      catchError(error => this.handleError(`updating status for task ${id}`, error))
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0), // Ignore returned data, return void
      catchError(error => this.handleError(`deleting task ${id}`, error))
    );
  }

  private handleError(operation: string, error: any): Observable<never> {
    console.error(`Error ${operation}:`, error);
    return throwError(() => new Error(`Failed while ${operation}. Please try again later.`));
  }
}
