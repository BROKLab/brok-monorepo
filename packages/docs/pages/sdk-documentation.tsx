import { Button, Card, Col, Container, Grid, Image, Link, Row, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AlertOctagonError, Wallet } from 'react-basicons';
import { NavBar } from '../src/ui/NavBar';
import { Code } from '../src/utils/Code';
import { Copy } from '../src/utils/Copy';



const SDKDocumentation: NextPage = () => {
    const router = useRouter()


    return (
        <div>
            <Head>
                <title>BRØK - SDK docs</title>
                <meta name="description" content="BRØK Cap Table" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            {/* NAVBAR */}
            <NavBar></NavBar>
            <Container
                as="main"
                display="flex"
                direction="column"
            // justify="center"
            // style={{ minHeight: '100vh' }}
            >
                {/* HERO */}
                <Spacer y={5}></Spacer>
                <Grid.Container justify="center" gap={4}>
                    <Grid xs={12} style={{ maxWidth: "70rem" }} justify="center" >
                        <Text h1>SDK documentation</Text>
                    </Grid>
                    <Grid xs={12} >
                        <Container gap={1}>
                            <Text h2>Getting started</Text>
                            <Text>
                                The SDK can be used read and write cap table data. To use the SDK you need to connect with
                            </Text>
                            <Spacer y={1}></Spacer>
                            <Container>
                                {/* Heading */}
                                <Grid.Container>
                                    <Grid xs={0} sm={3}>
                                        <Text b></Text>
                                    </Grid>
                                    <Grid xs={0} sm={3}>
                                        <Text b>Test URL</Text>
                                    </Grid>
                                    <Grid xs={0} sm={3}>
                                        <Text b>More info</Text>
                                    </Grid>
                                    <Grid xs={0} sm={3}>
                                        <Text b>Links</Text>
                                    </Grid>
                                </Grid.Container>
                                <Spacer y={1}></Spacer>
                                {/* Ceramic */}
                                <Grid.Container>
                                    <Grid xs={12} sm={3} >
                                        <Image width={35} src='https://assets.website-files.com/609ab8eae6dd417c085cc925/609b2ba76d637745d781160e_logo-ceramic.png'></Image>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Copy>https://ceramic-clay.3boxlabs.com</Copy>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Text> Ceramic is used to save changeable and personal (not sensetive) information.
                                            agdgdg</Text>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Link href='https://ceramic.network' target={"_blank"}>https://ceramic.network</Link>
                                    </Grid>
                                </Grid.Container>
                                <Spacer y={1}></Spacer>
                                {/* Ethereum RPC */}
                                <Grid.Container>
                                    <Grid xs={12} sm={3} >
                                        <Image objectFit="contain" height={35} width={30} src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1200px-Ethereum_logo_2014.svg.png'></Image>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Copy>https://goerli-rollup.arbitrum.io/rpc</Copy>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Text>Ethereum is used to hold information about all captables status and balances.</Text>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Col>
                                            <Link href='https://dashboard.alchemy.com/' target={"_blank"}>Alchemy</Link>
                                            <Link href='https://infura.ioa/' target={"_blank"}>Infura</Link>
                                        </Col>
                                    </Grid>
                                </Grid.Container>
                                <Spacer y={1}></Spacer>
                                {/* TheGraph */}
                                <Grid.Container>
                                    <Grid xs={12} sm={3} >
                                        <Image height={35} width={50} src='https://seeklogo.com/images/T/the-graph-grt-logo-B6802F6411-seeklogo.com.png'></Image>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Col>
                                            <Text b>brokDev</Text><Copy>https://api.thegraph.com/subgraphs/name/broklab/captable_dev_11</Copy>
                                            <Text b>brokStage</Text><Copy>https://api.thegraph.com/subgraphs/name/broklab/captable_stage_10</Copy>
                                        </Col>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Text>The Graph is used to index blockchain data to make it easy and efficient to query. It continously indexes the blockchain so expect real time data.</Text>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Col>
                                            <Link href='https://api.thegraph.com/subgraphs/name/broklab/captable_dev_11/graphql?query=%7B%0A++++++capTables%28first%3A5%29+%7B%0A++++++++++name%0A++++++++++id%0A++++++++++orgnr%0A++++++++++fagsystem%0A++++++++++symbol%0A++++++++++status%0A++++++++++partitions%0A++++++++++owner%0A++++++++++minter%0A++++++++++controllers%0A++++++++++totalSupply%0A++++++++++fagsystemDid%0A++++++++++tokenHolders+%7B%0A++++++++++++address%0A++++++++++++balances+%7B%0A++++++++++++++amount%0A++++++++++++++partition%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++%7D' target={"_blank"}>CapTable playground</Link>
                                            <Link href='https://thegraph.com/en/' target={"_blank"}>The Graph</Link>
                                        </Col>
                                    </Grid>
                                </Grid.Container>
                                <Spacer y={1}></Spacer>
                                {/* Wallet and DID */}
                                <Grid.Container>
                                    <Grid xs={12} sm={3} justify="center">
                                        <Wallet></Wallet>
                                    </Grid>
                                    <Grid xs={12} sm={3}  >
                                        <Col>
                                            <Copy>test test test test test test test test test test test junk</Copy>
                                            <Copy>did:key:z6MkjCcGLsuHuaRDw7tESJKTyAZW7dWde33JxdpgLJjX2PFR</Copy>
                                        </Col>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Text>Your wallet is used as an identifier.</Text>
                                    </Grid>
                                    <Grid xs={12} sm={3} >
                                        <Col>
                                            <Link href='https://ethereum.org/en/wallets/find-wallet/' target={"_blank"}>Find a Wallet</Link>
                                        </Col>
                                    </Grid>
                                </Grid.Container>

                            </Container>
                        </Container>

                        <Spacer y={3}></Spacer>
                    </Grid>
                    <Card variant="flat" css={{ backgroundColor: '$yellow300' }}>
                        <Card.Header >
                            <AlertOctagonError></AlertOctagonError><Spacer x={1}></Spacer>
                            <Text transform="uppercase">DONT USE Private keys and mnemonics with funds</Text>
                        </Card.Header>
                        <Card.Body>
                            <Text>
                                This way of initalizing identifier with private key or mnemonic will change. Probably we will accept some signer function. This is not suited for browser enviroments.
                            </Text>
                        </Card.Body>
                    </Card>
                    <Grid xs={12}>
                        <Col>
                            <Text>You must also pick a BRØK enviroment. </Text>
                            <ul>
                                <li><b>brokLocal</b> - Local ceramic, local graph, local blockchain</li>
                                <li><b>brokDev</b> - Ceramic: Clay testnetwork, Graph: Hosted services on Arbitrum Goerli, Ethereum: Arbitrum Goerli</li>
                                <li><b>brokStage</b> - Ceramic: Clay testnetwork, Graph: Hosted services on Arbitrum Goerli, Ethereum: Arbitrum Goerli</li>
                                <li><b>brokProd</b> - Ceramic: Mainnetwork, Graph: Hosted services on Arbitrum Nitro, Ethereum: Arbitrum Nitro</li>
                            </ul>
                            <Code lang='typescript' code={`
  const sdk = await SDK.init({
    ceramicUrl: 'https://ceramic-clay.3boxlabs.com',
    ethereumRpc: 'https://goerli-rollup.arbitrum.io/rpc',
    secret: 'test test test test test test test test test test test junk',
    theGraphUrl:
      'https://api.thegraph.com/subgraphs/name/broklab/captable_dev_11',
    env: 'brokDev',
  });
`} />
                            <Text>
                                This returns an SDK class instance with the following methods.
                            </Text>
                            <Code lang='typescript' code={`
    createCapTable(input: CreateCapTableInput): Promise<string>;
    getCapTable(capTableAddress: EthereumAddress): Promise<CapTable>;
    getCapTableList(skip?: number, limit?: number): Promise<CapTableGraphQL[]>;
    transfer(capTableAddress: CapTableEthereumId, transfers: TransferInput[]): Promise<(OperationResult & TransferRequest)[]>;
    deleteCapTable(capTableAddress: CapTableEthereumId): Promise<boolean>;
    updateShareholder(capTableAddress: CapTableEthereumId, shareholder: Partial<Shareholder>): Promise<Shareholder>;
    kapitalforhoyselseNyeAksjer(capTableAddress: CapTableEthereumId, transfers: IssueInput[]): Promise<(OperationResult & IssueRequest)[]>;
    splitt(capTableAddress: CapTableEthereumId, issues: IssueRequest[]): Promise<(OperationResult & IssueRequest)[]>;
    kapitalnedsettelseReduksjonAksjer(capTableAddress: CapTableEthereumId, redeems: RedeemRequest[]): Promise<(OperationResult & RedeemRequest)[]>;
    spleis(capTableAddress: CapTableEthereumId, redeems: RedeemRequest[]): Promise<(OperationResult & RedeemRequest)[]>;
    issueEcumbrance(shareholderCeramicID: CeramicID, encumbrance: Encumbrance): Promise<Shareholder>;
    editEcumbrance(shareholderCeramicID: CeramicID, encumbrance: Partial<Encumbrance>): Promise<Shareholder>
    deleteEcumbrance(shareholderCeramicID: CeramicID): Promise<Shareholder>
`} />
                            <Text>For more information about each type, see <Link as={"a"} target={"_blank"} href='https://github.com/BROKLab/brok-monorepo/blob/dev/packages/sdk/src/types.ts'>here</Link></Text>
                            <Card variant="flat" css={{ backgroundColor: '$yellow300' }}>
                                <Card.Header >
                                    <AlertOctagonError></AlertOctagonError><Spacer x={1}></Spacer>
                                    <Text >Access as fagsystem</Text>
                                </Card.Header>
                                <Card.Body>
                                    <Text>
                                        If you want access as a Fagsystem, we need to get your test public address and DID id.
                                        Contact us.
                                    </Text>
                                </Card.Body>
                            </Card>
                            <Text>You can test queries here: </Text>
                            <Row justify='center'>
                                <Button as={Link} href="https://stackblitz.com/edit/nextjs-j6bqhx?file=pages%2Findex.js">Sandbox browser(NextJS)</Button>
                            </Row>
                            <Spacer y={1}></Spacer>
                            <Row justify='center'>
                                <Button as={Link} href="https://stackblitz.com/edit/node-bzd6sj?file=index.js">Sandbox server(NodeJS)</Button>
                            </Row>
                        </Col>
                    </Grid>
                    <Grid xs={12}>
                        <Col>
                            <Text h2>Publish cap table</Text>
                            <Text>You must publish with current shareholder structure.</Text>
                            <Text>You must be a fagsystem to do this.</Text>
                            <Text>You can publish organisations or persons, type information is provided.</Text>
                            <Code code={`
  const indentifier = await sdk.createCapTable({
    name: "Hoved orginisasjonen AS",
    orgnr: "123 123 123",
    shareholders : [
        { // Org
            name: 'Fiske AS',
            organizationIdentifier: '123456789',
            organizationIdentifierType: 'EUID',
            amount: '500',
            countryCode: 'NO',
            postalcode: '05555',
            partition: 'ordinære',
        },
        { // Person
            name: 'Fiske AS',
            birthDate: '22-01-1977',
            amount: '500',
            countryCode: 'NO',
            postalcode: '05555',
            partition: 'ordinære',
        },
    ],
  });
  // for example indentifier = "0x59525c939ce8068ec2a18b0cd6b5151a850a4ff1"
`} lang="typescript"></Code>
                            <Text>Be sure to catch any errors thrown. In success it will give you back and indentifier which is the Ethereum address for the smart contract.</Text>
                        </Col>
                    </Grid>


                    <Grid xs={12}>
                        <Col>
                            <Text h2>Get cap table</Text>
                            <Text>When you have an address for a cap table you want to read.</Text>
                            <Code code={`
const capTable = await sdk.getCapTable("0x2c8ba63f2e2f42f7c897d8ebeebb5d04acc0725b");
`} lang="typescript"></Code>
                            <Text>This returns a cap table object</Text>
                            <Code lang='typescript' code={`
CapTable {
  ethAddress: '0x2c8ba63f2e2f42f7c897d8ebeebb5d04acc0725b',
  name: 'GRUNN MUSIKALSK TIGER AS',
  orgnr: '310790834',
  ceramicID: 'k2t6wyfsu4pfyq3yhkhlcpk0fyxkret5wc5wlml3yph6kgmk0zrp6bxzl17isg',
  totalShares: '80000.0',
  shareholders: [
    {
      balances: [Array],
      ethAddress: '0x1d8639b7a2fccf2983cb52155d93049656646212',
      name: 'Ola Nordmann',
      countryCode: 'NO',
      postalcode: '8313',
      birthDate: '1942-04-21',
      ceramicID: 'kjzl6cwe1jw145i19n2nw2rs2lzhg8bmsia3jd21ypjnm4si7uqn7l52m03nn0y'
    },
    ...
  ]
}
`}></Code>
                        </Col>
                    </Grid>


                    <Grid xs={12}>
                        <Col>
                            <Text h2>Get list of cap tables </Text>
                            <Text>When you want to get list of cap tables</Text>
                            <Code code={`
  const list = await sdk.getCapTableList();
  //  You can provide skip and limit to traverse. i.e. Skip 10, then get 30 cap tables
  //  const list = await sdk.getCapTableList(10, 30);
`} lang="typescript"></Code>
                            <Text>This query returns</Text>
                            <Card variant="flat" css={{ backgroundColor: '$yellow300' }}>
                                <Card.Header >
                                    <AlertOctagonError></AlertOctagonError><Spacer x={1}></Spacer>
                                    <Text >Not normalized data</Text>
                                </Card.Header>
                                <Card.Body>
                                    <Text>
                                        This data is directly from TheGraph. Later we will normalize this so that getCapTable() and getCapTableList() returns exactly the same information, where all amounts and data are normalized.
                                    </Text>
                                    <Text>
                                        Name is persisted on blockchain and Ceramic. This will probably change.
                                    </Text>
                                </Card.Body>
                            </Card>
                            <Code code={`
// returns 
[
    CapTableGraphQL {
        id: '0x2c8ba63f2e2f42f7c897d8ebeebb5d04acc0725b',
        name: 'GRUNN MUSIKALSK TIGER AS',
        orgnr: '310790834',
        fagsystem: '0xb977651ac2f276c3a057003f9a6a245ef04c7147',
        symbol: '310790834',
        status: 'APPROVED',
        partitions: [ 'ordinære' ],
        owner: '0xb977651ac2f276c3a057003f9a6a245ef04c7147',
        minter: '0xb977651ac2f276c3a057003f9a6a245ef04c7147',
        controllers: [ '0xb977651ac2f276c3a057003f9a6a245ef04c7147' ],
        totalSupply: '80000000000000000000000',
        fagsystemDid: 'did:key:z6Mktx33qNK6heU2hoGHBJNRhWCem7NTFp7QERt7wk3aXWim',
        tokenHolders: [
          {
            id: '0x2c8ba63f2e2f42f7c897d8ebeebb5d04acc0725b-0x1d8639b7a2fccf2983cb52155d93049656646212',
            address: '0x1d8639b7a2fccf2983cb52155d93049656646212',
            balances: [Array]
          },
          {
            id: '0x2c8ba63f2e2f42f7c897d8ebeebb5d04acc0725b-0x2c3d0351022f4939468bb3fb6edac16393430d38',
            address: '0x2c3d0351022f4939468bb3fb6edac16393430d38',
            balances: [Array]
          },
        ...
        ]
      },
      ...
]
`} lang="typescript"></Code>

                        </Col>
                    </Grid>


                    <Grid xs={12}>
                        <Col>
                            <Text h2>Transfer </Text>
                            <Text>When fagsystem wants to transfer. You must be a fagsystem identifier to do this.</Text>
                            <Code code={`
// two transfers
  const transferResult = await sdk.transfer(identifier, [
    {  // exisiting shareholder
        from: shareholderA.ethAddress,
        to: shareholderB.ethAddress,
        amount: '100',
        partition: 'ordinære',
    },
    { // New shareholder
        from: shareholderB.ethAddress,
        amount: '300',
        partition: 'ordinære',
        name: "Kari O'Connor",
        birthDate: '01-01-1988',
        countryCode: 'NO',
        postalcode: '0655',
    },
  ]);
`} lang="typescript"></Code>
                            <Text>This query returns</Text>
                            <Code code={`
// returns 
transferResult [
    {
      to: '0x97a74543a2ef334d582004b623932d1440d5c583',
      amount: '1',
      from: '0x1d8639b7a2fccf2983cb52155d93049656646212',
      partition: 'ordinære',
      success: true,
      message: 'Deployed to blockchain.'
    },
    {
      to: '0xcd92d12da6771d7eb72bf699d2694b2fde3ad52d',
      amount: '1',
      from: '0x1d8639b7a2fccf2983cb52155d93049656646212',
      partition: 'ordinære',
      success: true,
      message: 'Deployed to blockchain.'
    }
  ]
`} lang="typescript"></Code>

                        </Col>
                    </Grid>


                    <Grid xs={12}>
                        <Col>
                            <Text h2>Update shareholder </Text>
                            <Text>When fagsystem wants to update shareholder information. You must be a fagsystem identifier to do this.</Text>
                            <Code code={`
  const updatedShareholder = await sdk.updateShareholder(identifier, {
    name: 'Kari Nordmann',
    ethAddress: shareholderToUpdate.ethAddress,
  });
`} lang="typescript"></Code>
                            <Text>This query returns</Text>
                            <Code code={`
// returns 
updatedShareholder {
    name: 'Kari Nordmann',
    amount: '7000',
    birthDate: '1942-04-21',
    partition: 'ordinære',
    ethAddress: '0x1d8639b7a2fccf2983cb52155d93049656646212',
    postalcode: '8313',
    countryCode: 'NO',
    ceramicID: 'kjzl6cwe1jw145i19n2nw2rs2lzhg8bmsia3jd21ypjnm4si7uqn7l52m03nn0y',
    balances: [ { amount: '2582000000000000000000', partition: 'ordinære' } ]
}
`} lang="typescript"></Code>

                        </Col>
                    </Grid>






                </Grid.Container> {/* END FULL page */}

                <Card variant="flat" css={{ backgroundColor: '$yellow300' }}>
                    <Card.Header >
                        <AlertOctagonError></AlertOctagonError><Spacer x={1}></Spacer>
                        <Text >Debug</Text>
                    </Card.Header>
                    <Card.Body>
                        <Text>
                            Set env variable debug to brok* (ie. debug=brok* node index.js)
                        </Text>

                    </Card.Body>
                </Card>
                <Spacer y={2}></Spacer>

                <Card variant="flat" css={{ backgroundColor: '$yellow300' }}>
                    <Card.Header >
                        <AlertOctagonError></AlertOctagonError><Spacer x={1}></Spacer>
                        <Text>Smart contracts</Text>
                    </Card.Header>
                    <Card.Body>
                        <Text>
                            Artifacts, interfaces and deployments can be gotten from <Link as={"a"} href="https://www.npmjs.com/package/@brok/captable" target={"_blank"}>@brok/captable</Link>
                        </Text>
                        <Text>You can see addresses for each enviroment <Link as={"a"} href="https://github.com/BROKLab/brok-monorepo/tree/dev/packages/captable/deployments" target={"_blank"} >here</Link></Text>
                    </Card.Body>
                </Card>


                <Spacer y={5}></Spacer>


            </Container >
            <Spacer y={12}></Spacer>
        </div >
    )
}

export default SDKDocumentation
