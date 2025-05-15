import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CharacterModule } from './modules/character/character.module';
import { LocationModule } from './modules/location/location.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { CharacterEpisodeModule } from './modules/character-episode/character-episode.module';
import { CachingModule } from './cache/caching.module';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    DatabaseModule,
    CachingModule,
    CharacterModule,
    LocationModule,
    EpisodeModule,
    CharacterEpisodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CachingModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('graphql');
  }
}
