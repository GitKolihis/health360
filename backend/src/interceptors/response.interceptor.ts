/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */

import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface StandardResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: Date;
    path?: string;
    method?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<StandardResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const now = new Date();

        return next.handle().pipe(
            map((data) => {
                // Customize message based on HTTP method
                const message = this.getResponseMessage(request.method, data);

                return {
                    success: true,
                    statusCode: HttpStatus.OK,
                    message,
                    data: data || null,
                    timestamp: now,
                    path: request.url,
                    method: request.method,
                };
            }),
        );
    }

    private getResponseMessage(method: string, data: any): string {
        const messages = {
            GET: data?.length
                ? `${data.length} items retrieved successfully`
                : 'Data retrieved successfully',
            POST: 'Resource created successfully',
            PUT: 'Resource updated successfully',
            PATCH: 'Resource partially updated successfully',
            DELETE: 'Resource deleted successfully',
        };

        return messages[method] || 'Operation completed successfully';
    }

   
}