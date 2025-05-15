import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Character } from './character.entity';
import { Episode } from './episode.entity';

@Table({
    tableName: 'CharacterEpisode',
})
export class CharacterEpisode extends Model {

    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Character)
    @Column
    characterId: number;

    @ForeignKey(() => Episode)
    @Column
    episodeId: number;

    @Column
    createdDate: Date;

    @Column
    updatedDate: Date;

    @Column
    rowStatus: string;
}
