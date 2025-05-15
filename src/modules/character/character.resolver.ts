import { Args, Query, Resolver } from '@nestjs/graphql';
import { Character } from '../../database/entities/character.entity';
import { CharacterService } from './character.service';
import { CharacterResponseDto } from './dto/character-response.dto';
import { CharacterFilterDto } from './dto/character-filter.dto';
import { ExecutionTime } from 'src/utilities/utils';


@Resolver(() => CharacterResponseDto)
export class CharacterResolver {
    constructor(private readonly characterService: CharacterService) { }

    @Query(() => [CharacterResponseDto], { name: 'characters' })
    async getAllCharacters(): Promise<Character[]> {
        return this.characterService.findAllGraphQl();
    }

    @Query(() => [CharacterResponseDto], { name: 'charactersByFilters' })
    @ExecutionTime()
    async getCharactersByFilters(
        @Args('filters') filters: CharacterFilterDto
    ): Promise<Character[]> {
        console.log('Executing getCharactersByFilters', filters);
        return this.characterService.getCharactersByFilters(filters);
    }

    // @Query(() => CharacterRequestDto, { name: 'character', nullable: true })
    async getCharacterById(
        @Args('id') id: number
    ): Promise<Character | null> {
        return this.characterService.findById(id);
    }
}