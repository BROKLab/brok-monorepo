import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueProgress,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import {
  CreateCapTableWithBoardDirectorAddress,
  JobResult,
  TransferWithLoggedInUser,
} from 'src/types';
import { CapTableService } from './captable.service';

@Processor('captable-queue')
export class CapTableConsumer {
  constructor(private readonly capTableService: CapTableService) {}

  @Process('captable-job')
  async readCapTableJob(job: Job<CreateCapTableWithBoardDirectorAddress>) {
    job.progress(50);
    return await this.createCapTable(job);
  }

  @Process('delete-captable-job')
  async readDeleteCapTableJob(job: Job<string>) {
    job.progress(50);
    return await this.deleteCapTable(job);
  }

  @Process('transfer-job')
  async readTransferJob(job: Job<TransferWithLoggedInUser>) {
    job.progress(50);
    return await this.operatorTransfer(job);
  }

  async createCapTable(job: Job<CreateCapTableWithBoardDirectorAddress>) {
    const res = await this.capTableService.createCapTable(job.data);
    console.log('createCapTable, ', res);
    job.progress(100);
    if (res.isErr()) {
      return {
        success: false,
        error: res.error,
      };
    } else {
      return {
        success: true,
        data: res._unsafeUnwrap(),
      };
    }
  }

  async deleteCapTable(job: Job<string>) {
    const res = await this.capTableService.deleteCapTable(job.data);
    job.progress(100);
    if (res.isErr()) {
      return {
        success: false,
        error: res.error,
      };
    } else {
      return {
        success: true,
        data: res._unsafeUnwrap(),
      };
    }
  }

  async operatorTransfer(job: Job<TransferWithLoggedInUser>) {
    const res = await this.capTableService.operatorTransfer(job.data);
    job.progress(100);
    if (res.isErr()) {
      return {
        success: false,
        error: res.error,
      };
    } else {
      return {
        success: true,
        data: res._unsafeUnwrap(),
      };
    }
  }

  async wait(millis: number) {
    await new Promise((resolve) => setTimeout(resolve, millis));
  }

  @OnQueueProgress()
  onQueueProgress(job: Job, progress: number) {
    // console.log(`PROGRESS UPDATE: job id=${job.id} progress=${progress}`);
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job, result: JobResult) {
    console.log(`COMPLETED JOB: id=${job.id}`);
  }

  @OnQueueError()
  onQueueError(error: Error) {
    console.log('queue error', error);
  }

  @OnQueueFailed()
  onQueueFailed(error: Error) {
    // console.log('queue failed', error);
  }

  @OnQueueWaiting()
  onQueueWaiting(jobId: string) {
    // console.log('queue waiting', jobId);
  }
}
