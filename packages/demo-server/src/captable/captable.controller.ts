import { ShareholderCeramic } from '@brok/sdk';
import {
  CreateCapTableRequestInput,
  OperatorTransferExistingShareholderInput,
  OperatorTransferNewShareholderInput,
} from '@brok/sdk/src/types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DbService } from '../auth/db.service';
import { JobStatusRes } from './../types';
import { CaptableProducer } from './captable.producer';
import { CapTableService } from './captable.service';

@Controller('captable')
export class CapTableController {
  constructor(
    private readonly capTableProducerService: CaptableProducer,
    private readonly capTableService: CapTableService,
    private readonly authService: DbService,
  ) {}

  @HttpCode(202)
  @Post()
  async createCapTable(
    @Body('data') createCapTableRequestInput: CreateCapTableRequestInput,
    @Body('username') username: string,
  ) {
    const userAddress = await this.authService.loginOrSignUp(username);

    const jobId = await this.capTableProducerService.createCapTable({
      capTableInput: createCapTableRequestInput,
      loggedInUserAddress: userAddress,
    });
    return {
      href: `/captable/status/${jobId}`,
      id: jobId,
    };
  }

  @Get('/list')
  async listCapTables(
    @Query('orgnr') orgnr?: string,
    @Query('name') name?: string,
  ) {
    console.log('here in list');
    try {
      const capTables = await this.capTableService.listCapTables(orgnr, name);
      if (capTables.isErr()) {
        throw capTables.error;
      } else {
        return capTables.value;
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get('/:capTableAddress')
  async getCapTableDetails(@Param('capTableAddress') capTableAddress: string) {
    try {
      const res = await this.capTableService.getCapTableDetails(
        capTableAddress,
      );
      if (res.isErr()) throw res.error;
      else return res.value;
    } catch (error) {
      if (error instanceof Error) throw new HttpException(error.message, 400);
      if (typeof error === 'string') throw new HttpException(error, 400);
      if (Array.isArray(error)) throw new HttpException(error.join(', '), 400);
      console.log('error is', error);
      throw new HttpException('Internal Server Error', 500);
    }
  }

  @Get('status/:jobId')
  async getJobStatus(@Param('jobId') id: string) {
    try {
      if (isNaN(parseInt(id))) {
        throw new Error('Job ID not a number or valid format');
      }
      const job = await this.capTableProducerService.getJob(id);

      const jobStatusRes: JobStatusRes = {
        '@uri': `/captable/status/${id}`,
        id: id,
        jobStatus: await job.getState(),
        progress: await job.progress(),
        name: await job.name,
        result: (await job.isCompleted()) ? job.returnvalue : undefined,
      };

      console.log('jobstatus res', jobStatusRes);

      return jobStatusRes;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get('shareholders/:capTableAddress')
  async getShareholders(@Param('capTableAddress') address: string) {
    try {
      const userDataRes = await this.capTableService.getCapTableShareholders(
        address,
      );
      if (userDataRes.isErr()) throw userDataRes.error;
      else return userDataRes.value;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get('public/:ceramicUri')
  async getPublicUserData(
    @Param('capTableAddress') capTableAddress: string,
    @Param('userEthAddress') userEthAddress: string,
  ) {
    try {
      const userDataRes = await this.capTableService.getPublicUserData(
        capTableAddress,
        userEthAddress,
      );
      if (userDataRes.isErr()) throw userDataRes.error;
      else return userDataRes.value;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Post('transfer')
  async transfer(
    @Body('data')
    input:
      | OperatorTransferNewShareholderInput
      | OperatorTransferExistingShareholderInput,
    @Body('username') username: string,
  ) {
    const userAddress = await this.authService.loginOrSignUp(username);
    const jobId = await this.capTableProducerService.transfer({
      loggedInUserAddress: userAddress,
      transfer: input,
    });
    return {
      href: `/captable/status/${jobId}`,
      id: jobId,
    };
  }

  @Post('delete')
  async deleteCapTable(
    @Body('capTableAddress') address: string,
    @Body('username') username: string,
  ) {
    const userAddress = await this.authService.loginOrSignUp(username);
    console.log('userAddress', userAddress);
    console.log('delete address', address);
    const jobId = await this.capTableProducerService.deleteCapTable(address);
    return {
      href: `/captable/status/${jobId}`,
      id: jobId,
    };
  }

  @Post('public')
  async update(
    @Body('data') input: ShareholderCeramic,
    @Body('capTableAddress') capTableAddress: string,
    @Body('username') username: string,
  ) {
    try {
      const userAddress = await this.authService.loginOrSignUp(username);
      const updateRes = await this.capTableService.updateShareholderCeramic(
        capTableAddress,
        input,
        userAddress,
      );
      if (updateRes.isErr()) {
        throw updateRes.error;
      } else {
        return { success: true, uri: updateRes.value };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }
}
