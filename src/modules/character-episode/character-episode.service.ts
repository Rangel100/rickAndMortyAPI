import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CharacterEpisode } from 'src/database/entities/character-episode.entity';
import { ACTIVE_STATUS } from 'src/utilities/constants';

@Injectable()
export class CharacterEpisodeService {

    constructor(
        @InjectModel(CharacterEpisode)
        private _characterEpisodeModel: typeof CharacterEpisode,
    ) { }

    async findAll(): Promise<CharacterEpisode[]> {
        return this._characterEpisodeModel.findAll();
    }

    async findById(id: number): Promise<CharacterEpisode | null> {
        return this._characterEpisodeModel.findByPk(id);
    }

    async findByCharacterId(characterId: number): Promise<CharacterEpisode[]> {
        return this._characterEpisodeModel.findAll({
            where: { characterId }
        });
    }

    async findByEpisodeId(episodeId: number): Promise<CharacterEpisode[]> {
        return this._characterEpisodeModel.findAll({
            where: { episodeId }
        });
    }

    async create(characterEpisode: any): Promise<CharacterEpisode> {
        //set audit fields
        characterEpisode.createdDate = new Date();
        characterEpisode.rowStatus = ACTIVE_STATUS;
        return this._characterEpisodeModel.create(characterEpisode);
    }

    async bulkCreate(characterEpisodes: any[]): Promise<CharacterEpisode[]> {
        //set audit fields for all records
        const now = new Date();
        characterEpisodes = characterEpisodes.map(ce => ({
            ...ce,
            createdDate: now,
            rowStatus: ACTIVE_STATUS
        }));

        return this._characterEpisodeModel.bulkCreate(characterEpisodes);
    }
}
