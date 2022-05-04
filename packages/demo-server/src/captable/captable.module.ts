import { CapTableService } from './captable.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CapTableConsumer } from './captable.consumer';
import { CapTableController } from './captable.controller';
import { CaptableProducer } from './captable.producer';
import { DbModule } from '../auth/db.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: 'captable-queue',
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<BullModuleOptions> => {
        const redisTLSUrl = config.get<string>('REDIS_TLS_URL');
        if (redisTLSUrl) {
          const urlTLS = new URL(redisTLSUrl);
          console.log('redisTls', redisTLSUrl);
          console.log('host: ', urlTLS.hostname);
          console.log('port: ', urlTLS.port);
          console.log('password: ', urlTLS.password);
          return {
            redis: {
              password: urlTLS.password,
              tls: {
                passphrase: urlTLS.password,
                host: urlTLS.hostname,
                port: parseInt(urlTLS.port, 10),
                rejectUnauthorized: false,
              },
            },
          };
        } else {
          const redisUrl = config.get<string>('REDIS_URL');
          const url = new URL(redisUrl);
          console.log('host: ', url.hostname);
          console.log('port: ', url.port);
          console.log('password: ', url.password);
          console.log('here in not tls');

          return {
            redis: {
              host: url.hostname,
              port: parseInt(url.port, 10),
              password: url.password,
            },
          };
        }
      },
    }),
    DbModule,
  ],
  controllers: [CapTableController],
  providers: [CaptableProducer, CapTableConsumer, CapTableService],
})
export class CapTableModule {}
