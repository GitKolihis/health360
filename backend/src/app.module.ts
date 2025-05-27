import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_PIPE } from '@nestjs/core';
import { TasksController } from './tasks/controller/tasks.controller';
import { TasksService } from './tasks/service/tasks.service';

@Module({
  imports: [],
  controllers: [AppController, TasksController],
  providers: [
    AppService,
    TasksService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
  ],
})
export class AppModule {}
