import { Field, InputType, Int } from '@nestjs/graphql';
// import { IsOptional, IsString, IsEnum } from 'class-validator';

enum CharacterStatus {
    ALIVE = 'Alive',
    DEAD = 'Dead',
    UNKNOWN = 'unknown'
}

enum CharacterGender {
    FEMALE = 'Female',
    MALE = 'Male',
    GENDERLESS = 'Genderless',
    UNKNOWN = 'unknown'
}

@InputType()
export class CharacterFilterDto {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    status?: string;

    @Field({ nullable: true })
    species?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    gender?: string;

    @Field({ nullable: true })
    origin?: string;
}
