// import { run, ethers, deployments, config, network } from 'hardhat'
// import { AuthProvider } from '../src/typechain'

// async function main() {
//   await run('compile')
//   console.log('Deploying capTable on ', network.name)
//   if (network.name === 'hardhat') {
//     await deployments.fixture()
//   }
//   const deployment = await deployments.getOrNull('AuthProvider') // Token is available because the fixture was executed
//   if (!deployment) {
//     throw Error('You need to run deployment for ' + config.defaultNetwork)
//   }
//   const authProvider = (await ethers.getContractAt(
//     'AuthProvider',
//     deployment.address,
//   )) as AuthProvider
//   console.log('AuthProvider.address', deployment.address)
//   const accounts = await ethers.getSigners()
//   const newTTL = 94670778
//   const tx = await authProvider.setTTL(newTTL)
//   await tx.wait()
//   console.log('Updated TTL')
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error)
//     process.exit(1)
//   })
