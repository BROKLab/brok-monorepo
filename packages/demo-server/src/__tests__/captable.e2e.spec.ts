import { DbModule } from '../auth/db.module';
import { CreateCapTableInput, CreateCapTableRequestInput } from '@brok/sdk';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { createClient, RedisClientType } from 'redis';
import request from 'supertest';
import { CapTableModule } from '../captable/captable.module';
import { selskaper, users } from './dummydata';

export type Name = 'Carl' | 'Abe' | 'Ben';

enum IdentifierType {
  OrganizationNumber,
  EUID,
  LEI,
}

export type User = {
  username: string;
  password: string;
  fnr: string;
  name: string;
  email: string;
  postalcode: string;
  birthDate: string;
  countryCode: string;
  ethAddress: string;
  identifier: string;
  identifierType: IdentifierType;
};

export type Selskap = {
  orgnr: string;
  navn: string;
};

const matfabrikkenLegacy = selskaper[0];
const shareholders = Object.values(users).map((user) => {
  return {
    ceramic: {
      name: user.name,
      birthDate: user.birthDate,
      postalcode: user.postalcode,
      countryCode: user.countryCode,
      identifier: user.identifier,
      identifierType: user.identifierType,
    },
    blockchain: {
      amount: '10',
      partition: 'ORDINÆRE',
    },
  };
});

const capTable: CreateCapTableRequestInput = {
  name: matfabrikkenLegacy.navn,
  orgnr: matfabrikkenLegacy.orgnr,
  shareholders: shareholders,
};

describe('Captable e2e', () => {
  let app: INestApplication;
  let redisClient: RedisClientType;
  let queue: Queue;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/.${process.env.NODE_ENV}.env`,
        }),
        BullModule.forRoot({
          redis: {
            host: process.env.REDIS_URL.split(':')[0],
            port: parseInt(process.env.REDIS_URL.split(':')[1]),
          },
        }),
        DbModule,
        CapTableModule,
      ],
    }).compile();

    queue = moduleRef.get(getQueueToken('captable-queue'));

    redisClient = createClient({
      url: `redis://${process.env.REDIS_URL}`,
    });
    await redisClient.connect();

    app = moduleRef.createNestApplication();
    await app.init();

    console.log('running in', `${process.env.REDIS_URL}`);
  });

  afterEach(async () => {
    await app?.close();
    await redisClient.FLUSHALL();
    await redisClient?.disconnect();
  });

  it('should be able to use redis', async () => {
    const number = 10;
    await redisClient.SET('num', number);
    const num = await redisClient.GET('num');

    expect(parseInt(num)).toBe(number);
  });

  it('should dispatch job', async () => {
    const response = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });

    expect(response.status).toBe(202);
    console.log(response.body);

    const hrefJobStatus = response.body.href;
    const statusResponse = await request(app.getHttpServer()).get(
      hrefJobStatus,
    );
    console.log('body', statusResponse.body);
    expect(statusResponse.body.progress).toBe(50);
  });

  it.only('job number 2 should have progress 0 because has not started', async () => {
    const createCaptableJob_1 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });

    const createCaptableJob_2 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });

    console.log('job1', createCaptableJob_1.body.href);
    console.log('job2', createCaptableJob_2.body.href);

    const statusResponseJob_1 = await request(app.getHttpServer()).get(
      createCaptableJob_1.body.href,
    );

    const statusResponseJob_2 = await request(app.getHttpServer()).get(
      createCaptableJob_2.body.href,
    );

    console.log('body1', statusResponseJob_1.body);
    console.log('body2', statusResponseJob_2.body);

    expect(statusResponseJob_1.body.progress).toBe(50);
    expect(statusResponseJob_2.body.progress).toBe(0);
  }, 20000);

  it('concurring jobs should be visible waiting when queued', async () => {
    const createCaptableJob_1 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });
    const createCaptableJob_2 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });
    const createCaptableJob_3 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        data: capTable,
        username: 'testuser',
      });

    const waiting = await queue.getWaitingCount();
    expect(waiting).toBe(2);
  });

  it('Job should have status as failed when error is thrown', async () => {
    console.log('que waiting', await queue.getWaitingCount());
    console.log('job count', await queue.getJobCounts());
    const createCaptableJob_2 = await request(app.getHttpServer())
      .post('/captable/')
      .send({
        orgnr: 10,
      });

    const statusResponseJob_ = await request(app.getHttpServer()).get(
      createCaptableJob_2.body.href,
    );

    console.log('immit', statusResponseJob_.body);

    await wait(350);

    const statusResponseJob_2 = await request(app.getHttpServer()).get(
      createCaptableJob_2.body.href,
    );

    console.log('statusresponse 2', statusResponseJob_2.body);

    await wait(300);

    const statusResponseJob_3 = await request(app.getHttpServer()).get(
      createCaptableJob_2.body.href,
    );

    console.log('statusresponse 3', statusResponseJob_3.body);

    expect(statusResponseJob_2.body.job.jobStatus).toBe('failed');
    expect(await queue.getWaitingCount()).toBe(0);
    expect(await queue.getActiveCount()).toBe(0);
    expect(await queue.getFailedCount()).toBe(1);
  });

  describe('deploy capTable with SDK', () => {
    it('should return a job id', async () => {
      const response = await request(app.getHttpServer())
        .post('/captable/')
        .send({
          data: capTable,
          username: 'testuser',
        });

      expect(response.status).toBe(202);

      let resJob;
      const iterator = new Array(10);
      for await (const i of iterator) {
        await wait(5000);
        const deployCapTableJobStatus = await request(app.getHttpServer()).get(
          response.body.href,
        );
        if (deployCapTableJobStatus.body.job.jobStatus === 'completed') {
          resJob = deployCapTableJobStatus.body.job.result;
          break;
        }
      }

      wait(5000);

      const capTableUsers = await request(app.getHttpServer())
        .get(
          `/captable/shareholders/${resJob.data.deployBlockchainRes.capTableAddress}`,
        )
        .expect(200);

      console.log('capTableUsers', capTableUsers.body);

      expect(capTableUsers).not.toBeUndefined();
    });
  });
});

const wait = async (ms: number) => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};
