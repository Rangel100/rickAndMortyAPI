import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class EpisodeFilterDto {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    episode?: string;

    @Field({ nullable: true })
    air_date?: string;

    @Field(() => Int, { nullable: true, defaultValue: 1 })
    page?: number;

    @Field(() => Int, { nullable: true, defaultValue: 20 })
    limit?: number;
}
