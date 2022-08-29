import { CapTable, Shareholder, TransferInput } from "@brok/sdk";
import { Button, Card, Container, Grid, Loading, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import { getRandomShareholders, randomAmountInThousands } from '../src/utils/random-data';
import { getCapTable, getCapTables, transfer as transferSDK, updateShareholder } from '../src/utils/sdk';
import { ethers } from "ethers"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter()
  const [capTable, setCapTable] = useState<CapTable>();
  const [oldShareholder, setOldShareholder] = useState<Shareholder>();
  const [newShareholder, setNewShareholder] = useState<Shareholder>();
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let subscribed = true
    const doAsync = async () => {
      if (!capTable) {
        const res = await getCapTables(undefined, 1);
        const graphQLCapTable = res[0]
        if (subscribed && res.length > 0) {
          const capTable = await getCapTable(graphQLCapTable.id);
          if (subscribed && res.length > 0) {
            const random = Math.floor(Math.random() * ((capTable.shareholders.length - 1) - 0 + 1)) + 0;
            console.log(capTable.shareholders.length)
            console.log(random, random)
            const _oldShareholder = capTable.shareholders[random]
            console.log("capTable", capTable)
            setCapTable(capTable)
            console.log("_oldShareholder", _oldShareholder)
            setOldShareholder(_oldShareholder)
            setNewShareholder({
              ..._oldShareholder,
              name: random > 1 ? "Kari Nordmann" : "Ola Nordmann"
            })

          }
        }
      }
    };
    doAsync();
    return () => { subscribed = false }
  }, [capTable])

  const handleUpdate = async (newShareholder: Shareholder) => {
    if (!capTable) throw "Must have CapTable"

    try {
      if (!newShareholder) throw "Must have new shareholder"
      setPublishing(true)
      const tr = await updateShareholder(capTable.ethAddress, newShareholder);
      toast((t) => <Container>
        <Grid.Container>
          <Grid>
            <Text>{`Update shareholder`}</Text>
          </Grid>
          <Grid>
            <Button as='a' target="_blank" onPress={() => router.push(`/cap-table/${capTable.ethAddress}`)}>View cap table</Button>
          </Grid>
        </Grid.Container>
      </Container>, { type: "success" })
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        toast(e.message, { type: "error" })
      }
    }
    setPublishing(false)
  }


  return (
    <Container >
      <Head>
        <title>BRØK - Publish transfer shares</title>
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
            <Text h3>{`Requested shareholder updates for company ${capTable ? capTable.name : "..."}`}</Text>
            <Spacer y={2}></Spacer>
            {!capTable && <Loading></Loading>}
            <Grid.Container gap={1}>

              {newShareholder && oldShareholder &&
                <Grid xs={12} sm={6}>
                  <Card>
                    <Card.Header>
                      <Text h4>{`Update name`}</Text>
                    </Card.Header>
                    <Card.Body>
                      <Grid.Container gap={1}>
                        <Grid xs={6}>From:</Grid>
                        <Grid xs={6}>{oldShareholder.name}</Grid>
                        <Grid xs={6}>To:</Grid>
                        <Grid xs={6}>{newShareholder.name}</Grid>
                      </Grid.Container>
                    </Card.Body>
                    <Card.Footer>
                      <Button flat size={"sm"} disabled={publishing} onPress={() => handleUpdate(newShareholder)}>{publishing ? <Loading style={{ margin: 5 }}></Loading> : "Publish"}</Button>
                    </Card.Footer>
                  </Card>
                </Grid>
              }
            </Grid.Container>
          </Grid>
        </Grid.Container>

      </Container >
      <ToastContainer position="top-right"
        hideProgressBar={true}
        closeOnClick
        pauseOnHover ></ToastContainer>

    </Container >
  )
}

export default Home
