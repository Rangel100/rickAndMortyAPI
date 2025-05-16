import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CharacterService } from '../modules/character/character.service';

@Injectable()
export class TasksService {
    constructor(
        private readonly characterService: CharacterService,
    ) { }

    // Execute every 12 hours
    // @Cron('30 * * * * *')
    @Cron('0 0 */12 * *')
    async updateCharactersData() {
        console.log('Starting scheduled character update...');
        try {
            await this.characterService.updateCharactersInDatabase();
            console.log('Scheduled character update completed successfully.');
        } catch (error) {
            console.error('Error during scheduled character update:', error);
        }
    }
}
