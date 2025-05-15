import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
    DataType,
} from 'sequelize-typescript';
import { Location } from './location.entity';
import { Episode } from './episode.entity';
import { CharacterEpisode } from './character-episode.entity';

@Table({
    tableName: 'Character',
})
export class Character extends Model {
    @Column({ primaryKey: true })
    declare id: number;

    @Column
    name: string;

    @Column
    status: string;

    @Column
    species: string;

    @Column
    type: string;

    @Column
    gender: string;

    @Column
    image: string;

    @Column(DataType.STRING)
    url: string;

    @Column(DataType.DATE)
    created: Date;

    @ForeignKey(() => Location)
    @Column
    originId: number;

    @ForeignKey(() => Location)
    @Column
    locationId: number;

    @BelongsTo(() => Location, 'originId')
    origin: Location;

    @BelongsTo(() => Location, 'locationId')
    location: Location;

    @BelongsToMany(() => Episode, () => CharacterEpisode)
    episodes: Episode[];

    @Column
    createdDate: Date;

    @Column
    updatedDate: Date;

    @Column
    rowStatus: string;
}
