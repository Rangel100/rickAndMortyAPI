import { Module } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Episode } from 'src/database/entities/episode.entity';
import { EpisodeResolver } from './episode.resolver';
import { RickAndMortyApiService } from 'src/integrations/rick-and-morty-api.service';

@Module({
    imports: [SequelizeModule.forFeature([Episode])],
    providers: [EpisodeService, EpisodeResolver, RickAndMortyApiService],
    exports: [EpisodeService]
})
export class EpisodeModule { }
