import { Table, Column, Model, BelongsToMany, DataType } from 'sequelize-typescript';
import { Character } from './character.entity';
import { CharacterEpisode } from './character-episode.entity';

@Table({
    tableName: 'Episode',
})
export class Episode extends Model {
    @Column({ primaryKey: true })
    declare id: number;

    @Column
    name: string;

    @Column
    air_date: string;

    @Column
    episode: string;

    @Column(DataType.STRING)
    url: string;

    @Column(DataType.DATE)
    created: Date;

    @BelongsToMany(() => Character, () => CharacterEpisode)
    characters: Character[];

    @Column
    createdDate: Date;

    @Column
    updatedDate: Date;

    @Column
    rowStatus: string;
}
