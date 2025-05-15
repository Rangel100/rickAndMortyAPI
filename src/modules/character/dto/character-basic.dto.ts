import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CharacterBasicDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    status: string;

    @Field()
    species: string;

    @Field()
    gender: string;

    @Field()
    image: string;
}
