import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class EpisodeBasicDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    air_date: string;

    @Field()
    episode: string;
}
