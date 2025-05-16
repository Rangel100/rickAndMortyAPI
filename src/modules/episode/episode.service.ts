import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Episode } from 'src/database/entities/episode.entity';
import { ACTIVE_STATUS } from 'src/utilities/constants';
import { Op } from 'sequelize';
import { EpisodeFilterDto } from './dto/episode-filter.dto';
import { RickAndMortyApiService } from 'src/integrations/rick-and-morty-api.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EpisodeService {

    constructor(
        @InjectModel(Episode)
        private _episodeModel: typeof Episode,
        @Inject(CACHE_MANAGER) private _cacheService: Cache,
        private readonly rickAndMortyApiService: RickAndMortyApiService,
    ) { }

    async findAll(): Promise<Episode[]> {
        return this._episodeModel.findAll();
    }

    async findById(id: number): Promise<Episode | null> {
        return this._episodeModel.findByPk(id);
    }

    async create(episode: any): Promise<Episode> {
        //set audit fields
        episode.createdDate = new Date();
        episode.rowStatus = ACTIVE_STATUS;
        return this._episodeModel.create(episode);
    }

    async findOrCreateByExternalId(episodeData: any): Promise<Episode | null> {
        if (!episodeData || !episodeData.id) {
            return null;
        }

        let episode = await this._episodeModel.findOne({
            where: { id: episodeData.id }
        });

        if (!episode) {
            const newEpisode = {
                id: episodeData.id,
                name: episodeData.name,
                air_date: episodeData.air_date,
                episode: episodeData.episode,
                url: episodeData.url,
                created: new Date(episodeData.created),
                createdDate: new Date(),
                rowStatus: ACTIVE_STATUS
            };

            episode = await this._episodeModel.create(newEpisode);
            console.log(`Episode created: ${episode.name}`);
        }

        return episode;
    }

    async findOrCreateMultipleByExternalIds(episodesData: any[]): Promise<Episode[]> {
        console.log('Finding or creating multiple episodes');
        if (!episodesData || episodesData.length === 0) {
            return [];
        }

        const episodes: Episode[] = [];
        for (const episodeData of episodesData) {
            const episode = await this.findOrCreateByExternalId(episodeData);
            if (episode) {
                episodes.push(episode);
            }
        }

        return episodes;
    }

    async getEpisodesByFilters(filters: EpisodeFilterDto): Promise<Episode[]> {
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

    async getDataFromCacheByFilters(filters: EpisodeFilterDto): Promise<Episode[]> {
        // Check if the data is already in cache
        const cacheKey = `episodes_${JSON.stringify(filters)}`;
        const cachedData = await this._cacheService.get<Episode[]>(cacheKey);

        if (cachedData) {
            console.log('Returning episodes from cache');
            return cachedData;
        }
        console.log('Episodes cache miss');
        return [];
    }

    async getDataFromDatabaseByFilters(filters: EpisodeFilterDto): Promise<Episode[]> {
        const whereClause: any = {};

        if (filters.name) {
            whereClause.name = { [Op.iLike]: `%${filters.name}%` };
        }

        if (filters.episode) {
            whereClause.episode = { [Op.iLike]: `%${filters.episode}%` };
        }

        if (filters.air_date) {
            whereClause.air_date = { [Op.iLike]: `%${filters.air_date}%` };
        }

        const episodes = await this._episodeModel.findAll({
            where: whereClause,
            include: [
                { association: 'characters' }
            ]
        });

        // Cache results
        if (episodes.length > 0) {
            const cacheKey = `episodes_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, episodes, 60 * 30); // Cache for 30 min
        }

        return episodes;
    }

    async getDataFromAPIByFilters(filters: EpisodeFilterDto): Promise<Episode[]> {
        try {
            const apiEpisodes = await this.rickAndMortyApiService.getEpisodesByFilters(filters);
            const episodes: Episode[] = [];

            for (const apiEpisode of apiEpisodes) {
                let episode = await this.findOrCreateByExternalId(apiEpisode);
                if (episode) {
                    episodes.push(episode);
                }
            }

            // Save all episodes to cache with filter key
            const cacheKey = `episodes_${JSON.stringify(filters)}`;
            await this._cacheService.set(cacheKey, episodes, 60 * 30); // Cache for 30 min

            return episodes;
        } catch (error) {
            console.error('Error fetching episodes from Rick and Morty API:', error);
            return [];
        }
    }
}
