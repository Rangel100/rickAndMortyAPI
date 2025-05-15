import { Module } from '@nestjs/common';
import { CharacterEpisodeService } from './character-episode.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { CharacterEpisode } from 'src/database/entities/character-episode.entity';

@Module({
    imports: [SequelizeModule.forFeature([CharacterEpisode])],
    providers: [CharacterEpisodeService],
    exports: [CharacterEpisodeService]
})
export class CharacterEpisodeModule { }
