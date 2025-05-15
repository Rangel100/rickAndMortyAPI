import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import { createKeyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                return {
                    stores: [
                        new Keyv({
                            store: new CacheableMemory({ ttl: 600000 }),
                        }),
                        createKeyv('redis://localhost:6379'),
                    ],
                };
            },
        }),
    ],
    exports: [CacheModule]
})
export class CachingModule { }
