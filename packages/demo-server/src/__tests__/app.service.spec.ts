import { NetworkModule } from '../network/network.module';
import { Test } from '@nestjs/testing';

import { AppService } from '../app/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [NetworkModule],
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Welcome to helpers!"', () => {
      expect(service.getData()).toEqual({ message: 'Welcome to helpers!' });
    });
  });
});
