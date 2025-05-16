import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CharacterService } from './modules/character/character.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Initialize characters if database is empty
  const characterService = app.get(CharacterService);
  await characterService.initializeCharacters();

  await app.listen(port);
  console.log(`Aplicación iniciada en el puerto: ${port}`);
  console.log(`Redis configurado en localhost:6379`);
}
bootstrap();
