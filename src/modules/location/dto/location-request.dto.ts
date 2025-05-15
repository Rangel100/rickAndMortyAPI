import { Field, ID, ObjectType } from "@nestjs/graphql";
import { CharacterBasicDto } from "src/modules/character/dto/character-basic.dto";

@ObjectType()
export class LocationRequestDto {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    type: string;

    @Field()
    dimension: string;

    @Field()
    url: string;

    @Field()
    created: Date;

    @Field(() => [CharacterBasicDto], { nullable: true })
    characters?: CharacterBasicDto[];

    @Field(() => [CharacterBasicDto], { nullable: true })
    residents?: CharacterBasicDto[];
}
