import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación iniciada en el puerto: ${port}`);
  console.log(`Redis configurado en localhost:6379`);
}
bootstrap();
