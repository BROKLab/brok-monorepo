import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  CreateCapTableWithBoardDirectorAddress,
  TransferWithLoggedInUser,
} from 'src/types';

@Injectable()
export class CaptableProducer {
  constructor(@InjectQueue('captable-queue') private queue: Queue) {}

  async createCapTable(capTableInput: CreateCapTableWithBoardDirectorAddress) {
    const job = await this.queue.add('captable-job', capTableInput);
    return job.id;
  }

  async deleteCapTable(address: string) {
    const job = await this.queue.add('delete-captable-job', address);
    return job.id;
  }

  async transfer(input: TransferWithLoggedInUser) {
    const job = await this.queue.add('transfer-job', input);
    return job.id;
  }

  async getJob(jobId: string) {
    return await this.queue.getJob(jobId);
  }
}
