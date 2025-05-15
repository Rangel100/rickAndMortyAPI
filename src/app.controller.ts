import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get("hello")
  async getHellow(): Promise<string> {
    return this.appService.getDataFromCache();
  }

}
