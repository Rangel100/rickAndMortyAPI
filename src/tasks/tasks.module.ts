import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CharacterModule } from '../modules/character/character.module';
import { TasksService } from './tasks.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CharacterModule,
    ],
    providers: [TasksService],
})
export class TasksModule { }
