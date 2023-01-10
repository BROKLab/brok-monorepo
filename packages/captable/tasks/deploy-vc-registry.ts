// import { task } from "hardhat/config";
// import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
// import { VCRegistry__factory } from "../typechain-types";

// task("deploy-vc-registry", "Deploy CB token and VC Registry")
//   .addFlag("dev", "Deploy development state.")
//   .setAction(
//     async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
//       try {
//         // Check if the contract is already deployed
//         if (hre.deployments.vcRegistry) {
//           console.log(
//             `VC Registry allready deployed at ${hre.deployments.vcRegistry}`
//           );
//           return;
//         }
//         /* Setup wallets */
//         const [deployer] = await hre.ethers.getSigners();

//         /* Deploy VCRegistry */
//         const vcRegistry = await new VCRegistry__factory(deployer).deploy();

//         await vcRegistry.deployed();
//         hre.deployments.vcRegistry = vcRegistry.address;
//         console.log(`VC_REGISTRY_ADDRESS=${vcRegistry.address}`);
//         if (taskArgs.dev) {
//           // Get wallets
//           const devBank = new hre.ethers.Wallet(
//             process.env.DEV_BANK_PRIVATE_KEY!
//           ).connect(hre.ethers.provider);
//           const devWallet = new hre.ethers.Wallet(
//             process.env.DEV_PRIVATE_KEY!
//           ).connect(hre.ethers.provider);

//           const vcRegistryAsDevBank = vcRegistry.connect(devBank);

//           // Maybe fund DEV bank
//           const balanceDevBank = await devBank.getBalance();
//           if (balanceDevBank.eq(hre.ethers.constants.Zero)) {
//             const balanceDeployer = await deployer.getBalance();
//             if (!balanceDeployer.eq(hre.ethers.constants.Zero)) {
//               console.log(
//                 "Deployer has balance. Sending some ETH to DEV wallet because we are probably not on a gasless chain."
//               );
//               const fundTX = await deployer.sendTransaction({
//                 to: await devBank.getAddress(),
//                 value: balanceDeployer.div(hre.ethers.BigNumber.from(1000)),
//               });
//               await fundTX.wait();
//               console.log(
//                 `Funded DEV bank with ${hre.ethers.utils.formatEther(
//                   balanceDeployer.div(
//                     balanceDeployer.div(hre.ethers.BigNumber.from(1000))
//                   )
//                 )}`
//               );
//             }
//           }
//           // Maybe fund DEV wallet
//           const balanceDevWallet = await devWallet.getBalance();
//           if (balanceDevWallet.eq(hre.ethers.constants.Zero)) {
//             const balanceDeployer = await deployer.getBalance();
//             if (!balanceDeployer.eq(hre.ethers.constants.Zero)) {
//               console.log(
//                 "Deployer has balance. Sending some ETH to DEV wallet because we are probably not on a gasless chain."
//               );
//               const fundTX = await deployer.sendTransaction({
//                 to: await devWallet.getAddress(),
//                 value: balanceDeployer.div(hre.ethers.BigNumber.from(1000)),
//               });
//               await fundTX.wait();
//               console.log(
//                 `Funded DEV wallet with ${hre.ethers.utils.formatEther(
//                   balanceDeployer.div(
//                     balanceDeployer.div(hre.ethers.BigNumber.from(1000))
//                   )
//                 )}`
//               );
//             }
//           }

//           // Make DEPLOYER a bank
//           // console.log("Setting up DEPLOYER as a BANK in vcRegistry");
//           await (
//             await vcRegistry.authenticateBank(deployer.address, "DEV bank")
//           ).wait();

//           // Make a test account also a bank
//           await (
//             await vcRegistry.authenticateBank(
//               devBank.address,
//               "Test bank of Norway"
//             )
//           ).wait();

//           // DEV bank authenticates TEST PERSON
//           // DEV must be the bank that sets auth, because we want to test that only it can re-auth later.
//           const devPerson = new hre.ethers.Wallet(
//             process.env.DEV_PERSON_PRIVATE_KEY!
//           ).connect(hre.ethers.provider);
//           await (
//             await vcRegistryAsDevBank.setAuthenticatedPerson(devPerson.address)
//           ).wait();

//           // DEV bank authenticates DEV wallet
//           // DEV must be the bank that sets auth, because we want to test that only it can re-auth later.

//           await (
//             await vcRegistryAsDevBank.setAuthenticatedPerson(devWallet.address)
//           ).wait();

//           // Whitelist DEV Wallet bank that is deployed to production
//           if (hre.network.name === "bergen") {
//             await (
//               await vcRegistryAsDevBank.authenticateBank(
//                 "0xbeafaC4F6F2C90587B6945FD4c4315AF977D57Df",
//                 "DEV wallet Bank"
//               )
//             ).wait();
//           }

//           // console.log(`Done setting up DEV state for VCRegistry`);
//         }
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     }
//   );
