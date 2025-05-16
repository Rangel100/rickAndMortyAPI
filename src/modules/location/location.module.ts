import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Location } from 'src/database/entities/location.entity';
import { RickAndMortyApiService } from 'src/integrations/rick-and-morty-api.service';

@Module({
    imports: [SequelizeModule.forFeature([Location])],
    providers: [LocationService, RickAndMortyApiService],
    exports: [LocationService]
})
export class LocationModule { }
