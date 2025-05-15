import { Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { CharacterService } from './modules/character/character.service';

@Injectable()
export class AppService {

  constructor(
    private _chracterService: CharacterService,
    @Inject(CACHE_MANAGER) private _cacheService: Cache,
  ) { }

  async getHello(): Promise<string> {
    // Guardar datos en caché con un TTL personalizado (30 segundos)
    await this._cacheService.set("testKeyN", "Este es un valor de prueba");
    await this._cacheService.set("data", "Datos almacenados: " + new Date().toISOString());
    console.log("Datos guardados en caché de Redis");
    return 'Hello World! Datos guardados en Redis';
  }

  async getDataFromCache(): Promise<string> {
    // Recuperar datos del caché
    await this._chracterService.getDataFromCache();

    const cachedTestKey = await this._cacheService.get("testData");
    console.log("Cached Test Key: ", cachedTestKey);

    if (cachedTestKey) {
      return `Datos recuperados de Redis: ${cachedTestKey}`;
    } else {
      return 'No se encontraron datos en el caché de Redis';
    }
  }
}
