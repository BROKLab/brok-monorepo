import { SDK } from "@brok/sdk";
import { Button, Container, Grid, Spacer, Text, Table } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Key, useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import NoSSR from "../src/components/utils/NoSSR";
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import { ethers } from "ethers"
import { formatBN, formatCurrency } from "../src/components/utils/Formatters";


const fetcher = (url: string) => fetch(url).then((res) => res.json());



const Search: NextPage = () => {
  const router = useRouter()
  const [capTables, setCapTables] = useState<Awaited<ReturnType<SDK["getCapTableList"]>>>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  const getCapTables = async (skip?: number, limit?: number) => {
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
    return await sdk.getCapTableList(skip, limit);
  }

  useEffect(() => {
    let subscribed = true
    const doAsync = async () => {
      const list = await getCapTables(skip, limit)
      if (subscribed) {
        setCapTables(list)
      }
    };
    doAsync();
    return () => { subscribed = false }
  }, [skip, limit])

  const onSelect = (key: string) => {
    router.push("/cap-table/" + key)
  }

  return (
    <Container >
      <Head>
        <title>BRØK - Search cap tables</title>
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
        <Grid.Container gap={2} css={{ p: '$sm' }} justify="center" >
          <Grid>
            <Text h3>Registry</Text>
          </Grid>
          <Grid xs={12} justify="center">
            <NoSSR>
              <Table
                aria-label="Example table with static content"
                hoverable
                onSelectionChange={(keys) => onSelect(Object.values(keys)[1])}
                selectionMode="single"

                css={{
                  height: "auto",
                  minWidth: "100%",
                }}
              >
                <Table.Header>
                  <Table.Column>ID</Table.Column>
                  <Table.Column>NAME</Table.Column>
                  <Table.Column>TOTAL SHARES</Table.Column>
                  <Table.Column>SHAREHOLDERS</Table.Column>
                </Table.Header>
                <Table.Body >
                  {capTables.map(capTable => (
                    <Table.Row key={capTable.id} >
                      <Table.Cell>{capTable.orgnr}</Table.Cell>
                      <Table.Cell>{capTable.name}</Table.Cell>
                      <Table.Cell>{formatBN(ethers.BigNumber.from(capTable.totalSupply))}</Table.Cell>
                      <Table.Cell>{`${capTable.tokenHolders.length + 1}`}</Table.Cell>

                    </Table.Row>
                  ))}
                </Table.Body>

              </Table>

            </NoSSR>
          </Grid>
          <Grid>
            <Button.Group>
              <Button disabled={skip === 0} onPress={() => setSkip(old => old - limit)}>Previous</Button>
              <Button onPress={() => setSkip(old => old + limit)}>Next</Button>
            </Button.Group>
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

export default Search
