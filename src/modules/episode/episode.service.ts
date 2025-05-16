import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Episode } from 'src/database/entities/episode.entity';
import { ACTIVE_STATUS } from 'src/utilities/constants';

@Injectable()
export class EpisodeService {

    constructor(
        @InjectModel(Episode)
        private _episodeModel: typeof Episode
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

}
