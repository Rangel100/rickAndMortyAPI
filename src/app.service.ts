import { Injectable } from '@nestjs/common';
import { CharacterService } from './modules/character/character.service';

@Injectable()
export class AppService {

  constructor(
    private _chracterService: CharacterService
  ) { }

  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  async getScheduleTask(): Promise<string> {
    // Recuperar datos del caché
    await this._chracterService.updateCharactersInDatabase();
    return 'Characters updated in database!';
  }
}
