import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Character } from 'src/database/entities/character.entity';
import { Location } from 'src/database/entities/location.entity';
import { ACTIVE_STATUS, EPISODE_ATTRIBUTE_URL, LOCATION_ATTRIBUTE_URL, UNKNOWN_DATA } from 'src/utilities/constants';
import { Cache } from 'cache-manager';
import { Op } from 'sequelize';
import { RickAndMortyApiService } from 'src/integrations/rick-and-morty-api.service';
import { LocationService } from '../location/location.service';
import { EpisodeService } from '../episode/episode.service';
import { CharacterEpisodeService } from '../character-episode/character-episode.service';
import { CharacterFilterDto } from './dto/character-filter.dto';
import { mapResponse, mapResponseFromCache } from 'src/utilities/utils';

@Injectable()
export class CharacterService {

    constructor(
        @InjectModel(Character) private _characterModel: typeof Character,
        @Inject(CACHE_MANAGER) private _cacheService: Cache,
        private readonly rickAndMortyApiService: RickAndMortyApiService,
        private readonly locationService: LocationService,
        private readonly episodeService: EpisodeService,
        private readonly characterEpisodeService: CharacterEpisodeService,
    ) { }

    async findAll(): Promise<Character[]> {
        return this._characterModel.findAll();
    }

    async findAllGraphQl(): Promise<Character[]> {

        const characters = await this._characterModel.findAll({
            include: [
                { association: 'origin' },
                { association: 'location' },
                { association: 'episodes' }
            ]
        });
        const charactersPlain = mapResponse(characters);
        return charactersPlain;
    }

    async findById(id: number): Promise<Character | null> {
        return this._characterModel.findByPk(id);
    }

    async create(character: any): Promise<Character> {
        //set audit fields
        character.createdDate = new Date();
        character.rowStatus = ACTIVE_STATUS;
        return this._characterModel.create(character);
    }

    async getDataFromCache() {
        // This is a placeholder for the actual cache retrieval logic
        const setedData = await this._cacheService.set("testData", "testData");
        console.log("Set Data: ", setedData);
        return;
    }

    async getDataFromCacheByFilters(filters): Promise<Character[]> {
        // Check if the data is already in cache
        console.log('Executing service characters by filters from cache');

        const cacheKey = `characters_${JSON.stringify(filters)}`;
        const cachedData = await this._cacheService.get<Character[]>(cacheKey);

        if (cachedData) {
            console.log('Returning data from cache');
            const mappedData = mapResponseFromCache(cachedData);
            return mappedData;
        }
        console.log('Missing data in cache');
        return [];
    }

    async getDataFromDatabaseByFilters(filters): Promise<Character[]> {
        console.log('Executing service characters by filters from database');
        console.log('Filters received: ', JSON.stringify(filters));

        const whereClause: any = {};
        const includeOptions: any[] = [];

        if (filters.name) {
            console.log('Filter by name is present');
            whereClause.name = { [Op.iLike]: `%${filters.name}%` };
        }

        if (filters.status) {
            console.log('Filter by status is present');
            whereClause.status = filters.status;
        }

        if (filters.species) {
            console.log('Filter by species is present');
            whereClause.species = { [Op.iLike]: `%${filters.species}%` };
        }

        if (filters.type) {
            console.log('Filter by type is present');
            whereClause.type = { [Op.iLike]: `%${filters.type}%` };
        }

        if (filters.gender) {
            console.log('Filter by gender is present');
            whereClause.gender = filters.gender;
        }

        // Handle origin filtering
        if (filters.origin) {
            console.log('Filter by origin is present');
            includeOptions.push({
                association: 'origin',
                where: {
                    name: { [Op.iLike]: `%${filters.origin}%` }
                }
            });
        } else {
            includeOptions.push({ association: 'origin' });
        }

        // Handle location and episodes filtering
        includeOptions.push({ association: 'location' });
        includeOptions.push({ association: 'episodes' });

        console.log('Where clause', whereClause);
        console.log('With includesoptions: ', JSON.stringify(includeOptions));
        let characters: Character[] = await this._characterModel.findAll({
            where: whereClause,
            include: includeOptions
        });

        const charactersPlain = mapResponse(characters);
        if (characters.length > 0) {
            // Save the data to cache
            console.log('Data found in database, Saving in cache');
            const cacheKey = `characters_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, characters);
            console.log('Data cached successfully');
            return charactersPlain;
        }
        console.log('missing data in database');
        return [];
    }

    async getDataFromAPIByFilters(filters): Promise<Character[]> {
        try {
            console.log('Executing service characters by filters from API');
            // Get characters from Rick and Morty API
            const apiCharacters = await this.rickAndMortyApiService.getCharactersByFilters(filters);
            if (!apiCharacters || apiCharacters.length === 0) {
                return [];
            }

            // Process each character and save them to the database
            const characters: Character[] = [];
            for (const apiCharacter of apiCharacters) {
                // Process origin location if it exists
                let origin: Location | null = null;
                if (apiCharacter.origin && apiCharacter.origin.name !== UNKNOWN_DATA) {
                    // Get the location ID from the URL
                    const originUrl = apiCharacter.origin.url;
                    if (originUrl) {
                        const splitedOriginId = originUrl.split(LOCATION_ATTRIBUTE_URL).pop();
                        const originId = parseInt(splitedOriginId);
                        if (originId) {
                            // Get full location data from API
                            const locationData = await this.rickAndMortyApiService.getLocationById(originId);
                            origin = await this.locationService.findOrCreateByExternalId(locationData);
                        }
                    }
                }

                // // Process current location if it exists
                let location: Location | null = null;
                if (apiCharacter.location && apiCharacter.location.name !== UNKNOWN_DATA) {
                    // Get the location ID from the URL
                    const locationUrl = apiCharacter.location.url;
                    if (locationUrl) {
                        const splitedLocationId = locationUrl.split(LOCATION_ATTRIBUTE_URL).pop();
                        const locationId = parseInt(splitedLocationId);
                        if (locationId) {
                            // Get full location data from API
                            const locationData = await this.rickAndMortyApiService.getLocationById(locationId);
                            location = await this.locationService.findOrCreateByExternalId(locationData);
                        }
                    }
                }

                // Create character
                let character = await this._characterModel.findOne({
                    where: { id: apiCharacter.id },
                    include: [
                        { association: 'origin' },
                        { association: 'location' },
                        { association: 'episodes' }
                    ]
                });

                if (!character) {
                    // Create new character
                    const newCharacter = {
                        id: apiCharacter.id,
                        name: apiCharacter.name,
                        status: apiCharacter.status,
                        species: apiCharacter.species,
                        type: apiCharacter.type,
                        gender: apiCharacter.gender,
                        image: apiCharacter.image,
                        url: apiCharacter.url,
                        created: new Date(apiCharacter.created),
                        originId: origin ? origin.id : null,
                        locationId: location ? location.id : null,
                        createdDate: new Date(),
                        rowStatus: ACTIVE_STATUS
                    };

                    character = await this._characterModel.create(newCharacter);
                    console.log(`Character created: ${character.name}`);

                    // Process episodes if they exist
                    if (apiCharacter.episode && apiCharacter.episode.length > 0) {
                        // Extract episode IDs from URLs
                        const episodeIds = apiCharacter.episode.map(url =>
                            parseInt(url.split(EPISODE_ATTRIBUTE_URL).pop())
                        ).filter(id => !isNaN(id));

                        if (episodeIds.length > 0 && character) {
                            // Get all episodes data from API
                            const episodesData = await this.rickAndMortyApiService.getMultipleEpisodes(episodeIds);
                            const episodes = await this.episodeService.findOrCreateMultipleByExternalIds(episodesData);

                            // Link character to episodes
                            if (episodes && episodes.length > 0) {
                                const characterEpisodes = episodes.map(episode => ({
                                    characterId: character!.id,
                                    episodeId: episode.id
                                }));
                                await this.characterEpisodeService.bulkCreate(characterEpisodes);
                            }
                        }
                    }
                }

                character = await this._characterModel.findOne({
                    where: { id: apiCharacter.id },
                    include: [
                        { association: 'origin' },
                        { association: 'location' },
                        { association: 'episodes' }
                    ]
                });

                characters.push(character!);
            }

            console.log('Returning data from API');
            const plainCharacters = mapResponse(characters);

            // Save all characters to cache with filter key
            const cacheKey = `characters_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, characters);


            return plainCharacters;
        } catch (error) {
            console.error('Error fetching data from Rick and Morty API:', error);
            return [];
        }
    }

    async getCharactersByFilters(filters: CharacterFilterDto): Promise<Character[]> {
        // Try to get data from cache
        console.log('Executing service characters by filters');
        const cacheData = await this.getDataFromCacheByFilters(filters);
        if (cacheData && cacheData.length > 0) {
            console.log('Returning data from cache');
            // console.log(cacheData);
            return cacheData;
        }

        // Try to get data from database
        console.log('Executing service characters by filters from database');
        const dbData = await this.getDataFromDatabaseByFilters(filters);
        if (dbData && dbData.length > 0) {
            console.log('Returning data from database');
            // console.log(dbData);
            return dbData;
        }

        // Try to get data from API
        const apiData = await this.getDataFromAPIByFilters(filters);
        if (apiData && apiData.length > 0) {
            console.log('Returning data from API');
            // console.log(apiData);
            return apiData;
        }

        return [];
    }

    async updateCharactersInDatabase(): Promise<void> {
        console.log('Updating characters in database over cron job');

        // Get all characters from the database
        const characters = await this._characterModel.findAll({
            include: [
                { association: 'origin' },
                { association: 'location' },
                { association: 'episodes' }
            ]
        });

        if (!characters || characters.length === 0) {
            console.log('No characters found in the database');
            return;
        }

        const characterIds: number[] = characters.map(character => character.id);
        console.log('Character IDs:', characterIds);

        // Fetch characters from the API using the IDs
        const apiCharacters = await this.rickAndMortyApiService.getMultipleCharacters(characterIds);

        for (const apiCharacter of apiCharacters) {
            // Get the character from the database
            const character = characters.find(c => c.id === apiCharacter.id);
            if (!character) continue;

            console.log('Updating Character data from database.');
            if (character.name !== apiCharacter.name ||
                character.status !== apiCharacter.status ||
                character.species !== apiCharacter.species ||
                character.type !== apiCharacter.type ||
                character.gender !== apiCharacter.gender ||
                character.image !== apiCharacter.image) {
                // Update the character in the database
                this._characterModel.update(
                    {
                        name: apiCharacter.name,
                        status: apiCharacter.status,
                        species: apiCharacter.species,
                        type: apiCharacter.type,
                        gender: apiCharacter.gender,
                        image: apiCharacter.image
                    },
                    { where: { id: character.id } }
                );
            }

            console.log('Updating Character Origin and data from database.');
            // Update the origin location if it exists
            if (apiCharacter.origin && apiCharacter.origin.url !== "") {
                const originUrl = apiCharacter.origin.url;
                if (originUrl) {
                    const splitedOriginId = originUrl.split(LOCATION_ATTRIBUTE_URL).pop();
                    const originId = parseInt(splitedOriginId);
                    if (originId) {
                        const locationData = await this.rickAndMortyApiService.getLocationById(originId);
                        const location = await this.locationService.findOrCreateByExternalId(locationData);

                        // Update the character's origin in the database if location is not null
                        if (location) {
                            // Update the location in the database
                            await this.locationService.updateLocation(location.id, locationData);

                            await this._characterModel.update(
                                { originId: location.id },
                                { where: { id: character.id } }
                            );
                        }
                    }
                }
            }

            console.log('Updating Character Location and data from database.');
            // Update the current location if it exists
            if (apiCharacter.location && apiCharacter.location.url !== "") {
                const locationUrl = apiCharacter.location.url;
                if (locationUrl) {
                    const splitedLocationId = locationUrl.split(LOCATION_ATTRIBUTE_URL).pop();
                    const locationId = parseInt(splitedLocationId);
                    if (locationId) {
                        const locationData = await this.rickAndMortyApiService.getLocationById(locationId);
                        const location = await this.locationService.findOrCreateByExternalId(locationData);

                        // Update the character's location in the database if location is not null
                        if (location) {
                            // Update the location in the database
                            await this.locationService.updateLocation(location.id, locationData);

                            await this._characterModel.update(
                                { locationId: location.id },
                                { where: { id: character.id } }
                            );
                        }
                    }
                }
            }

            console.log('Updating Character Episodes from database.');
            // Update the episodes if they exist
            if (apiCharacter.episode && apiCharacter.episode.length > 0) {
                // Extract episode IDs from URLs
                const episodeIds = apiCharacter.episode.map(url =>
                    parseInt(url.split(EPISODE_ATTRIBUTE_URL).pop())
                ).filter(id => !isNaN(id));

                if (episodeIds.length > 0) {
                    // Get all episodes data from API
                    const episodesData = await this.rickAndMortyApiService.getMultipleEpisodes(episodeIds);
                    console.log('Episodes Fetched from API.');
                    const episodes = await this.episodeService.findOrCreateMultipleByExternalIds(episodesData);
                    console.log('Episodes Fetched from Database.');
                    const existingEpisodes = await this.characterEpisodeService.findByCharacterId(character.id);
                    console.log('Existing CharacterEpisodes Fetched from Database.');

                    // Get the IDs of existing episodes in the database
                    const existingEpisodeIds = existingEpisodes.map(ce => ce.dataValues.episodeId);
                    console.log('Existing episode IDs for character', existingEpisodeIds);

                    // Get the IDs of episodes from the API
                    const apiEpisodeIds = episodes.map(episode => episode.id);
                    console.log('API episode IDs for character ', apiEpisodeIds);

                    // Find episodes that exist in the API but not in the database
                    const episodesToCreate = episodes.filter(episode => !existingEpisodeIds.includes(episode.id));
                    console.log('Episodes to create for character', episodesToCreate.length);

                    if (episodesToCreate.length > 0) {
                        console.log('Creating character-episode relations');
                        // Create new character-episode relations
                        const characterEpisodesToCreate = episodesToCreate.map(episode => ({
                            characterId: character.id,
                            episodeId: episode.id
                        }));
                        await this.characterEpisodeService.bulkCreate(characterEpisodesToCreate);
                    }

                    // find episodes that exist in the database but not in the API
                    const episodeRelationsToDelete = existingEpisodes.filter(
                        ce => !apiEpisodeIds.includes(ce.dataValues.episodeId)
                    );
                    console.log('Episodes relations to delete for character ', episodeRelationsToDelete.length);

                    if (episodeRelationsToDelete.length > 0) {
                        // Delete character-episode relations
                        console.log('Deleting character-episode relations');
                        await this.characterEpisodeService.bulkDelete(episodeRelationsToDelete);
                    }
                }
            }
        }
        console.log('Characters updated successfully');
    }
}
