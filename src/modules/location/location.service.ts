import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Location } from 'src/database/entities/location.entity';
import { ACTIVE_STATUS } from 'src/utilities/constants';
import { Op } from 'sequelize';
import { LocationFilterDto } from './dto/location-filter.dto';
import { RickAndMortyApiService } from 'src/services/rick-and-morty-api.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LocationService {

    constructor(
        @InjectModel(Location)
        private _locationModel: typeof Location,
        @Inject(CACHE_MANAGER) private _cacheService: Cache,
        private readonly rickAndMortyApiService: RickAndMortyApiService,
    ) { }

    async findAll(): Promise<Location[]> {
        return this._locationModel.findAll();
    }

    async findById(id: number): Promise<Location | null> {
        return this._locationModel.findByPk(id);
    }

    async create(location: any): Promise<Location> {
        //set audit fields
        location.createdDate = new Date();
        location.rowStatus = ACTIVE_STATUS;
        return this._locationModel.create(location);
    }

    async findOrCreateByExternalId(locationData: any): Promise<Location | null> {
        if (!locationData || !locationData.id) {
            return null;
        }

        let location = await this._locationModel.findOne({
            where: { id: locationData.id }
        });

        if (!location) {
            const newLocation = {
                id: locationData.id,
                name: locationData.name,
                type: locationData.type,
                dimension: locationData.dimension,
                url: locationData.url,
                created: new Date(locationData.created),
                createdDate: new Date(),
                rowStatus: ACTIVE_STATUS
            };

            location = await this._locationModel.create(newLocation);
            console.log(`Location created: ${location.name}`);
        }

        return location;
    }

    async findOrCreateMultipleByExternalIds(locationsData: any[]): Promise<Location[]> {
        if (!locationsData || locationsData.length === 0) {
            return [];
        }

        const locations: Location[] = [];
        for (const locationData of locationsData) {
            const location = await this.findOrCreateByExternalId(locationData);
            if (location) {
                locations.push(location);
            }
        }

        return locations;
    }

    async getLocationsByFilters(filters: LocationFilterDto): Promise<Location[]> {
        // Step 1: Try to get data from cache
        const cacheData = await this.getDataFromCacheByFilters(filters);
        if (cacheData && cacheData.length > 0) {
            return cacheData;
        }

        // Step 2: Try to get data from database
        const dbData = await this.getDataFromDatabaseByFilters(filters);
        if (dbData && dbData.length > 0) {
            return dbData;
        }

        // Step 3: If not found in cache or database, get from API
        return this.getDataFromAPIByFilters(filters);
    }

    async getDataFromCacheByFilters(filters: LocationFilterDto): Promise<Location[]> {
        // Check if the data is already in cache
        const cacheKey = `locations_${JSON.stringify(filters)}`;
        const cachedData = await this._cacheService.get<Location[]>(cacheKey);

        if (cachedData) {
            console.log('Returning locations from cache');
            return cachedData;
        }
        console.log('Locations cache miss');
        return [];
    }

    async getDataFromDatabaseByFilters(filters: LocationFilterDto): Promise<Location[]> {
        const whereClause: any = {};

        if (filters.name) {
            whereClause.name = { [Op.iLike]: `%${filters.name}%` };
        }

        if (filters.type) {
            whereClause.type = { [Op.iLike]: `%${filters.type}%` };
        }

        if (filters.dimension) {
            whereClause.dimension = { [Op.iLike]: `%${filters.dimension}%` };
        }

        const locations = await this._locationModel.findAll({
            where: whereClause,
            include: [
                { association: 'characters' },
                { association: 'residents' }
            ]
        });

        // Cache results
        if (locations.length > 0) {
            const cacheKey = `locations_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, locations, 60 * 30); // Cache for 30 min
        }

        return locations;
    }

    async getDataFromAPIByFilters(filters: LocationFilterDto): Promise<Location[]> {
        try {
            const apiLocations = await this.rickAndMortyApiService.getLocationsByFilters(filters);
            const locations: Location[] = [];

            for (const apiLocation of apiLocations) {
                let location = await this.findOrCreateByExternalId(apiLocation);
                if (location) {
                    locations.push(location);
                }
            }

            // Save all locations to cache with filter key
            const cacheKey = `locations_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, locations, 60 * 30); // Cache for 30 min

            return locations;
        } catch (error) {
            console.error('Error fetching locations from Rick and Morty API:', error);
            return [];
        }
    }
}
