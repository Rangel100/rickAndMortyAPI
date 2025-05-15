import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LocationBasicDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    type: string;

    @Field()
    dimension: string;
}
