import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Character } from './entities/character.entity';
import { Location } from './entities/location.entity';
import { Episode } from './entities/episode.entity';
import { CharacterEpisode } from './entities/character-episode.entity';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'rickandmorty',
            models: [Character, Location, Episode, CharacterEpisode],
            autoLoadModels: true,
            synchronize: true,
            logging: false,
        }),
        SequelizeModule.forFeature([Character, Location, Episode, CharacterEpisode])
    ],
})
export class DatabaseModule { }
