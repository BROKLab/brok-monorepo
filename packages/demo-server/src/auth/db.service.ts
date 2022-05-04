import { Injectable } from '@nestjs/common';
import { Ownership } from '@prisma/client';
import { ethers } from 'ethers';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class DbService {
  constructor(private prismaService: PrismaService) {}

  async findCapTableByAddress(capTableAddress: string) {
    try {
      return this.prismaService.capTable.findFirst({
        where: {
          address: capTableAddress,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async saveBdAddressToCapTableAddress(
    bdAddress: string,
    capTableAddress: string,
  ) {
    try {
      return await this.prismaService.capTable.create({
        data: {
          address: capTableAddress,
          boardDirectorAddress: bdAddress,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async loginOrSignUp(username) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: username,
        },
      });

      if (!user) {
        const wallet = ethers.Wallet.createRandom();
        const newUser = await this.prismaService.user.create({
          data: {
            id: username,
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            ownership: Ownership.USERNAME,
          },
        });
        return newUser.address;
      } else {
        return user.address;
      }
    } catch (error) {
      throw error;
    }
  }
}
