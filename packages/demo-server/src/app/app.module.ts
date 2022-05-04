import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CapTableModule } from './../captable/captable.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const lastIndexPortSeperator = process.env.REDIS_URL.lastIndexOf(':');
if (lastIndexPortSeperator === -1) {
  throw new Error('No REDIS_URL found in environment variables');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    CapTableModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<BullModuleOptions> => {
        const redisTLSUrl = config.get<string>('REDIS_TLS_URL');
        if (redisTLSUrl) {
          const urlTLS = new URL(redisTLSUrl);
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
  ],
  controllers: [AppController],
  exports: [ConfigModule],
  providers: [AppService],
})
export class AppModule {}
