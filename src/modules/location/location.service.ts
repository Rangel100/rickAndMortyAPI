import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Location } from 'src/database/entities/location.entity';
import { ACTIVE_STATUS } from 'src/utilities/constants';

@Injectable()
export class LocationService {

    constructor(
        @InjectModel(Location)
        private _locationModel: typeof Location
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
            console.log('Location created');
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

    async updateLocation(id: number, locationData: any): Promise<void> {
        const location = await this._locationModel.findByPk(id);

        if (location) {
            if (location.name !== locationData.name ||
                location.type !== locationData.type ||
                location.dimension !== locationData.dimension ||
                location.url !== locationData.url
            ) {
                // Update the location with the new data
                await this._locationModel.update({
                    name: locationData.name,
                    type: locationData.type,
                    dimension: locationData.dimension,
                    url: locationData.url,
                    updatedDate: new Date()
                }, {
                    where: { id }
                });
            }
        }

    }

}
