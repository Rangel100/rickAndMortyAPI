import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LocationFilterDto {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    dimension?: string;

    @Field(() => Int, { nullable: true, defaultValue: 1 })
    page?: number;

    @Field(() => Int, { nullable: true, defaultValue: 20 })
    limit?: number;
}
