import { Field, ID, ObjectType } from "@nestjs/graphql";
import { LocationBasicDto } from "../../location/dto/location-basic.dto";
import { EpisodeBasicDto } from "../../episode/dto/episode-basic.dto";

@ObjectType()
export class CharacterResponseDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    status: string;

    @Field()
    species: string;

    @Field()
    type: string;

    @Field()
    gender: string;

    @Field()
    image: string;

    @Field()
    url: string;

    @Field()
    created: Date;

    @Field(() => LocationBasicDto, { nullable: true })
    origin: LocationBasicDto;

    @Field(() => LocationBasicDto, { nullable: true })
    location: LocationBasicDto;

    @Field(() => [EpisodeBasicDto], { nullable: true })
    episodes: EpisodeBasicDto[];
}
