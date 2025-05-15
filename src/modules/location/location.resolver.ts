import { Args, Query, Resolver } from '@nestjs/graphql';
import { Location } from '../../database/entities/location.entity';
import { LocationService } from './location.service';
import { LocationRequestDto } from './dto/location-request.dto';
import { LocationFilterDto } from './dto/location-filter.dto';

@Resolver(() => LocationRequestDto)
export class LocationResolver {
    constructor(private readonly locationService: LocationService) { }

    // @Query(() => [LocationRequestDto], { name: 'locations' })
    async getAllLocations(): Promise<Location[]> {
        return this.locationService.findAll();
    }

    // @Query(() => LocationRequestDto, { name: 'location', nullable: true })
    async getLocationById(
        @Args('id') id: number
    ): Promise<Location | null> {
        return this.locationService.findById(id);
    }

    // @Query(() => [LocationRequestDto], { name: 'locationsByFilters' })
    async getLocationsByFilters(
        @Args('filters') filters: LocationFilterDto
    ): Promise<Location[]> {
        return this.locationService.getLocationsByFilters(filters);
    }
}
