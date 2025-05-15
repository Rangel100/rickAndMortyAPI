import { Args, Query, Resolver } from '@nestjs/graphql';
import { Episode } from '../../database/entities/episode.entity';
import { EpisodeService } from './episode.service';
import { EpisodeRequestDto } from './dto/episode-request.dto';
import { EpisodeFilterDto } from './dto/episode-filter.dto';

@Resolver(() => EpisodeRequestDto)
export class EpisodeResolver {
    constructor(private readonly episodeService: EpisodeService) { }

    // @Query(() => [EpisodeRequestDto], { name: 'episodes' })
    async getAllEpisodes(): Promise<Episode[]> {
        return this.episodeService.findAll();
    }

    // @Query(() => EpisodeRequestDto, { name: 'episode', nullable: true })
    async getEpisodeById(
        @Args('id') id: number
    ): Promise<Episode | null> {
        return this.episodeService.findById(id);
    }

    // @Query(() => [EpisodeRequestDto], { name: 'episodesByFilters' })
    async getEpisodesByFilters(
        @Args('filters') filters: EpisodeFilterDto
    ): Promise<Episode[]> {
        return this.episodeService.getEpisodesByFilters(filters);
    }
}
