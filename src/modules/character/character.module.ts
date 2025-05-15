import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Character } from 'src/database/entities/character.entity';
import { CachingModule } from 'src/cache/caching.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriverConfig, ApolloFederationDriver, ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { CharacterResolver } from './character.resolver';
import { join } from 'path';
import { RickAndMortyApiService } from 'src/services/rick-and-morty-api.service';
import { LocationModule } from '../location/location.module';
import { EpisodeModule } from '../episode/episode.module';
import { CharacterEpisodeModule } from '../character-episode/character-episode.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Character]),
        CachingModule,
        LocationModule,
        EpisodeModule,
        CharacterEpisodeModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: true,
            introspection: true,
        })
    ],
    providers: [CharacterService, CharacterResolver, RickAndMortyApiService],
    exports: [CharacterService]
})
export class CharacterModule { }
