import { SDK } from "@brok/sdk";
import { Button, Container, Grid, Spacer, Table, Text } from '@nextui-org/react';
import { ethers } from "ethers";
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import { formatBN, formatCurrency, formatOrgNumber } from "../../src/components/utils/Formatters";
import NoSSR from "../../src/components/utils/NoSSR";
import { Footer } from '../../src/ui/Footer';
import { NavBar } from '../../src/ui/NavBar';


const fetcher = (url: string) => fetch(url).then((res) => res.json());



const CapTable: NextPage = () => {
  const router = useRouter()
  const { address } = router.query
  console.log(address)
  const [capTable, setCapTable] = useState<Awaited<ReturnType<SDK["getCapTable"]>>>();

  const getCapTable = async (address: string) => {
    if (!(process.env.NEXT_PUBLIC_BROK_ENVIRONMENT &&
      process.env.NEXT_PUBLIC_CERAMIC_URL &&
      process.env.NEXT_PUBLIC_ETHEREUM_RPC &&
      process.env.NEXT_PUBLIC_THE_GRAPH_URL &&
      process.env.NEXT_PUBLIC_SECRET)) {
      throw "Please set ENV variables"
    }
    const sdk = await SDK.init({
      ceramicUrl: process.env.NEXT_PUBLIC_CERAMIC_URL, ethereumRpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
      secret: process.env.NEXT_PUBLIC_SECRET, theGraphUrl: process.env.NEXT_PUBLIC_THE_GRAPH_URL, env: process.env.NEXT_PUBLIC_BROK_ENVIRONMENT
    });
    return await sdk.getCapTable(address);
  }

  useEffect(() => {
    let subscribed = true
    const doAsync = async () => {
      if (address && typeof address === "string") {
        const capTable = await getCapTable(address)
        if (subscribed) {
          setCapTable(capTable)
        }
      }
    };
    doAsync();
    return () => { subscribed = false }
  }, [address])

  // const onSelect = (key: string) => {
  //   router.push("/cap-table/" + key)
  // }


  return (
    <Container >
      <Head>
        <title>BRØK - Cap table</title>
        <meta name="description" content="BRØK Cap Table" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <NavBar></NavBar>
      <Container
        as="main"
        display="flex"
        direction="column"
        alignItems="center"
        style={{ height: '80vh' }}
      >
        <Spacer y={4}></Spacer>
        <Grid.Container gap={2} >
          <Grid xs={12}>
            <Text h1>Cap Table</Text>
          </Grid>
          <Grid xs={12}>
            {capTable &&
              <Grid.Container gap={1} alignItems="center">
                <Grid xs={6} >
                  <Text>Name</Text>
                </Grid>
                <Grid xs={6} >
                  <Text h3>{capTable.name}</Text>
                </Grid>
                <Grid xs={6} >
                  <Text>Org number</Text>
                </Grid>
                <Grid xs={6} >
                  <Text h3>{formatOrgNumber(capTable.orgnr)}</Text>
                </Grid>
                <Grid xs={6} >
                  <Text>Total Shares</Text>
                </Grid>
                <Grid xs={6} >
                  <Text h3>{formatCurrency(parseInt(capTable.totalShares))}</Text>
                </Grid>
                <Grid xs={6} >
                  <Text>Data sources</Text>
                </Grid>
                <Grid xs={6} >
                  <Button.Group size="xs">
                    <Button as="a" target={"_blank"} href={`https://testnet.arbiscan.io/address/${address}`}>Blockchain</Button>
                    <Button as="a" target={"_blank"} href={`https://ceramic-clay.3boxlabs.com/api/v0/streams/${capTable.ceramicID}`}>Ceramic</Button>
                  </Button.Group>
                </Grid>
              </Grid.Container>
            }
          </Grid>
          <Grid>

            <Text h2>Shareholders</Text>
          </Grid>
          <Grid justify="center">
            {capTable &&

              <NoSSR>
                <Table
                  aria-label="Example table with static content"
                  hoverable

                  selectionMode="single"
                  css={{
                    height: "auto",
                    minWidth: "100%",
                  }}
                >
                  <Table.Header>
                    <Table.Column>NAME</Table.Column>
                    <Table.Column>Birth date</Table.Column>
                    <Table.Column>Org ID</Table.Column>
                    <Table.Column>Org ID type</Table.Column>
                    <Table.Column>Postalcode</Table.Column>
                    <Table.Column>Country</Table.Column>
                    <Table.Column>Antall aksjer</Table.Column>
                    <Table.Column>Prosent</Table.Column>
                    <Table.Column>Data sources</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {capTable.shareholders.map(shareholder => (
                      <Table.Row key={shareholder.ethAddress} >
                        <Table.Cell>{shareholder.name}</Table.Cell>
                        <Table.Cell>{"birthDate" in shareholder ? shareholder.birthDate : "-"}</Table.Cell>
                        <Table.Cell>{"organizationIdentifier" in shareholder ? shareholder.organizationIdentifier : "-"}</Table.Cell>
                        <Table.Cell>{"organizationIdentifierType" in shareholder ? shareholder.organizationIdentifierType : "-"}</Table.Cell>
                        <Table.Cell>{shareholder.postalcode}</Table.Cell>
                        <Table.Cell>{shareholder.countryCode}</Table.Cell>
                        <Table.Cell>{formatBN(shareholder.balances.reduce((prev, b) => prev.add(ethers.BigNumber.from(b.amount)), ethers.constants.Zero))}</Table.Cell>
                        <Table.Cell>{(shareholder.balances.reduce((prev, b) => prev.add(ethers.BigNumber.from(b.amount)), ethers.constants.Zero).mul(ethers.BigNumber.from("100")).div(ethers.utils.parseEther(capTable.totalShares))).toString()} %</Table.Cell>
                        <Table.Cell>
                          <Button.Group size="xs">
                            <Button as="a" target={"_blank"} href={`https://testnet.arbiscan.io/address/${shareholder.ethAddress}`}>Blockchain</Button>
                            <Button as="a" target={"_blank"} href={`https://ceramic-clay.3boxlabs.com/api/v0/streams/${shareholder.ceramicID}`}>Ceramic</Button>
                          </Button.Group>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>

                </Table>

              </NoSSR>
            }
          </Grid>
        </Grid.Container>



      </Container>
      <Footer></Footer>
      <ToastContainer position="top-right"
        hideProgressBar={true}
        closeOnClick
        pauseOnHover ></ToastContainer>

    </Container >
  )
}

export default CapTable
