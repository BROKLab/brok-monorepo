import { Ownership, Prisma, PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

const brregSeed = process.env.SEED;
const brregWallet = ethers.Wallet.fromMnemonic(brregSeed);

const userData: Prisma.UserCreateInput[] = [
  {
    id: 'brok',
    address: brregWallet.address,
    publicKey: brregWallet.publicKey,
    privateKey: brregWallet.privateKey,
    ownership: Ownership.USERNAME,
  },
];

async function main() {
  console.log('Start seeding....');
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(
      `Created user with username: ${user.id} and address: ${user.address}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
