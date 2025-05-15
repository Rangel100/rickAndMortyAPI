import { Field, ID, ObjectType } from "@nestjs/graphql";
import { CharacterBasicDto } from "src/modules/character/dto/character-basic.dto";

@ObjectType()
export class EpisodeRequestDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    air_date: string;

    @Field()
    episode: string;

    @Field()
    url: string;

    @Field()
    created: Date;

    @Field(() => [CharacterBasicDto], { nullable: true })
    characters?: CharacterBasicDto[];
}
