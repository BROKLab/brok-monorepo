import { CapTable, TransferInput } from "@brok/sdk";
import { Button, Card, Container, Grid, Loading, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import { getRandomShareholders, randomAmountInThousands } from '../src/utils/random-data';
import { getCapTable, getCapTables, transfer as transferSDK } from '../src/utils/sdk';
import { ethers } from "ethers"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter()
  const [capTable, setCapTable] = useState<CapTable>();
  const [transfers, setTransfers] = useState<TransferInput[]>([]);
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
            const randomNewShareholder = await getRandomShareholders(1);
            const transfers: TransferInput[] = [];
            let i = 0;
            let max = 2
            for (const s of capTable.shareholders) {
              if (i === 2) break;
              if (i === 0 && randomNewShareholder.length > 0) {
                // new shareholder transfer 
                const newS = randomNewShareholder[0]
                transfers.push({
                  name: newS.visningnavn,
                  birthDate: newS.foedselsdato,
                  postalcode: newS.postalCode,
                  countryCode: "NO",
                  partition: "ordinære",
                  amount: randomAmountInThousands(100_000).toString(),
                  from: s.ethAddress
                })
              } else {
                const balance = parseInt(ethers.utils.formatUnits(s.balances.reduce((prev, b) => prev.add(ethers.BigNumber.from(b.amount)), ethers.constants.Zero).div(3)))
                transfers.push({
                  from: s.ethAddress,
                  to: capTable.shareholders[i].ethAddress,
                  partition: "ordinære",
                  amount: randomAmountInThousands(balance).toString(),
                })
              }
              i++;
            }
            setCapTable(capTable)
            setTransfers(transfers)
          }
        }
      }
    };
    doAsync();
    return () => { subscribed = false }
  }, [capTable])

  const getNameForEthAddress = (address: string): string => {
    const maybeShareholder = capTable?.shareholders.find(s => s.ethAddress === address)
    return maybeShareholder ? maybeShareholder.name : `${address.slice(0, 3)} .. ${address.slice(-1, -3)}`
  }

  const publishTransfer = async (transfer: TransferInput) => {
    if (!capTable) throw "Must have CapTable"

    try {
      await transferSDK(capTable.ethAddress, [transfer]);
      toast((t) => <Container>
        <Grid.Container>
          <Grid>
            <Text>{`Published transfer`}</Text>
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
            <Text h3>{`Requested transfers for company ${capTable ? capTable.name : "..."}`}</Text>
            <Spacer y={2}></Spacer>
            {!capTable && <Loading></Loading>}
            <Grid.Container gap={1}>

              {transfers.map(transfer => (
                <Grid xs={12} sm={6} key={`${transfer.amount}-${transfer.from}`}>
                  <Card>
                    <Card.Header>
                      <Text h4>{`Transfer ${transfer.amount}`}</Text>
                    </Card.Header>
                    <Card.Body>
                      <Grid.Container gap={1}>
                        <Grid xs={6}>From:</Grid>
                        <Grid xs={6}>{getNameForEthAddress(transfer.from)}</Grid>
                        <Grid xs={6}>To:</Grid>
                        <Grid xs={6}>{"to" in transfer ? getNameForEthAddress(transfer.to) : transfer.name}</Grid>
                        <Grid xs={6}>Amount</Grid>
                        <Grid xs={6}>{transfer.amount}</Grid>
                        <Grid xs={6}>Partition</Grid>
                        <Grid xs={6}>{transfer.partition}</Grid>
                        <Grid xs={6}>New shareholder</Grid>
                        <Grid xs={6}>{"to" in transfer ? "Yes" : "No"}</Grid>
                      </Grid.Container>
                    </Card.Body>
                    <Card.Footer>
                      <Button flat size={"sm"} disabled={publishing} onPress={() => publishTransfer(transfer)}>{publishing ? <Loading style={{ margin: 5 }}></Loading> : "Publish"}</Button>
                    </Card.Footer>
                  </Card>
                </Grid>
              ))}
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
