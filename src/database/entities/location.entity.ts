import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { Character } from './character.entity';

@Table({
    tableName: 'Location',
})
export class Location extends Model {
    @Column({ primaryKey: true })
    declare id: number;

    @Column
    name: string;

    @Column
    type: string;

    @Column
    dimension: string;

    @Column(DataType.STRING)
    url: string;

    @Column(DataType.DATE)
    created: Date;

    @HasMany(() => Character, 'originId')
    characters: Character[];

    @HasMany(() => Character, 'locationId')
    residents: Character[];

    @Column
    createdDate: Date;

    @Column
    updatedDate: Date;

    @Column
    rowStatus: string;
}
