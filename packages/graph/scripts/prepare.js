const Mustache = require('mustache');
const brok = require('@brok/captable');
const yaml = require('js-yaml');
const fs = require('fs');

const args = process.argv.slice(2);
const env = args[0];
const subgraphConfig = yaml.load(fs.readFileSync('subgraph.example.yaml', 'utf8'));

// set address
for (const dataSource of subgraphConfig.dataSources) {
    dataSource.source.address = brok.Deployments[env].contracts.CapTableRegistry.address;
    if(env === 'brokLocal') {
        dataSource.source.startBlock =  1;
    } 
    if (env === 'brokStage' || env === 'brokDev') {
        dataSource.source.startBlock =  10778701;
    } 
    if( env === 'brokProd') {
        dataSource.source.startBlock =  10722028;
    }
}
// set chain
if(env === 'brokLocal'){
    for (const dataSource of subgraphConfig.dataSources) {
        dataSource.network = "mainnet";
    }
    for (const template of subgraphConfig.templates) {
        template.network = "mainnet";
    }
} else if (env === 'brokProd'){
    for (const dataSource of subgraphConfig.dataSources) {
        dataSource.network = "arbitrum";
    }
    for (const template of subgraphConfig.templates) {
        template.network = "arbitrum";
    }
}else{
    for (const dataSource of subgraphConfig.dataSources) {
        dataSource.network = "arbitrum-rinkeby";
    }
    for (const template of subgraphConfig.templates) {
        template.network = "arbitrum-rinkeby";
    }
}

fs.writeFileSync('subgraph.yaml', yaml.dump(subgraphConfig));