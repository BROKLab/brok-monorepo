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
    const res = await this.capTableService.createCapTable(job.data);
    console.log('createCapTable, ', res);
    if (res.isErr()) {
      return {
        success: false,
        error: res.error,
      };
    } else {
      job.progress(100);
      return {
        success: true,
        data: res._unsafeUnwrap(),
      };
    }
  }

  @Process('delete-captable-job')
  async readDeleteCapTableJob(job: Job<string>) {
    job.progress(50);
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

  @Process('transfer-job')
  async readTransferJob(job: Job<TransferWithLoggedInUser>) {
    try {
      job.progress(50);
      console.log('Starting job', job);
      const res = await this.capTableService.operatorTransfer(job.data);
      console.log('operatorTransfer, ', res);
      job.progress(100);
      if (res.isErr()) {
        return {
          success: false,
          error: res.error,
        };
      } else {
        return {
          success: true,
          data: res._unsafeUnwrap,
        };
      }
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        data: error.message,
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
