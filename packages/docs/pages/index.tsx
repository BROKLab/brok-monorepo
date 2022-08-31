import { Card, Container, Grid, styled, Text, Navbar, Dropdown, Button, Link, Avatar, Spacer, Col, Row, Image } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BankFinancial } from 'react-basicons'
import NoSSR from '../src/NoSSR';
import { TSCode } from '../src/utils/Code';



const Home: NextPage = () => {
  const router = useRouter()
  const exampleCode = `
  const sdk = await SDK.init({
    ceramicUrl: process.env.NEXT_PUBLIC_CERAMIC_URL, ethereumRpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
    secret: process.env.NEXT_PUBLIC_SECRET, theGraphUrl: process.env.NEXT_PUBLIC_THE_GRAPH_URL, env: process.env.NEXT_PUBLIC_BROK_ENVIRONMENT
  });
  `;


  return (
    <div>
      <Head>
        <title>BRØK docs</title>
        <meta name="description" content="BRØK Cap Table" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      {/* NAVBAR */}


      <Navbar variant="static" maxWidth={"fluid"}>
        <Navbar.Brand>
          <Text h1 >BRØK docs</Text>
        </Navbar.Brand>
        <Navbar.Content
          enableCursorHighlight
          activeColor="secondary"
          hideIn="xs"
          variant="underline"
        >

          <Navbar.Link isActive href="#">
            Getting stared
          </Navbar.Link>
          <Navbar.Link href="#">SDK</Navbar.Link>
          <Navbar.Link href="#">Contact</Navbar.Link>
        </Navbar.Content>
        <Navbar.Content>

          <Navbar.Item>
            <Avatar></Avatar>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>
      <Container
        as="main"
        display="flex"
        direction="column"
      // justify="center"
      // style={{ minHeight: '100vh' }}
      >
        {/* HERO */}
        <Grid.Container  >
          <Spacer y={5}></Spacer>
          <Grid xs={12} justify="center">
            <Col>
              <Row justify="center">
                <Text h2>Base layer cap table solution</Text>
              </Row>
              <Container justify="center" style={{ maxWidth: "50rem" }}>
                <Text>A new way of providing public services is emerging. An ecosystem, where the public sector and industry work together to meet and exceed people&rsquo;s expectations! All within a base layer ensuring privacy (GDPR), law, and human goals. We are establishing a new framework for developing cap table services and we call it BRØK.</Text>
              </Container>
            </Col>

          </Grid>
        </Grid.Container>
        <Spacer y={12}></Spacer>

        {/* FIRST */}
        <Grid.Container>
          <Grid xs={12} >
            <Container justify='center' style={{ maxWidth: "50rem" }}>
              <Row >
                <Text h2>BRØK is the foundation of a truly transparent and accessible business registry. From now on, anyone can be sure who owns what and when.</Text>
              </Row>
            </Container>
          </Grid>
        </Grid.Container>

        <Spacer y={12}></Spacer>

        <Grid.Container>
          <Grid xs={12} sm={6} >
            <Container gap={2} style={{ maxWidth: "25rem" }}>
              <Text h3>Sandbox</Text>
              <Spacer y={2}></Spacer>
              <Row justify='center'>
                <Button as={Link} href="https://stackblitz.com/edit/nextjs-j6bqhx?file=pages%2Findex.js">Sandbox browser(NextJS)</Button>
              </Row>
              <Spacer y={1}></Spacer>
              <Row justify='center'>
                <Button as={Link} href="https://stackblitz.com/edit/node-bzd6sj?file=index.js">Sandbox server(NodeJS)</Button>
              </Row>
            </Container>
          </Grid>
          <Grid xs={12} sm={6} >
            <Container gap={2} style={{ maxWidth: "25rem" }}>
              <Text h3>Install</Text>
              <Row align='center' >
                <Image height={50} width={50} alt='NPM' src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/npm-icon.svg"></Image>
                <TSCode code={`npm i @brok/sdk  `} lang="bash"></TSCode>
              </Row>
              <Row align='center'>
                <Image height={50} width={50} alt='Yarn' src="https://iconape.com/wp-content/files/ub/352181/svg/yarn-seeklogo.com.svg"></Image>
                <TSCode code={`yarn add @brok/sdk`} lang="bash"></TSCode>
              </Row>
              <Row align='center'>
                <Image height={50} width={50} alt='PNPM' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAAAUVBMVEX5rQBOTk7////6wUB6enr7xUz/+ey9vb22trb//fj94KD93ZfS0tL+6r+mpqb81n+CgoLy8vL80XD+6Lj95rH81Hn+8dLe3t6bm5vJycn19fUy73DjAAABGklEQVR4nO3ay05CQRBFUQR8gIriC/H/P9S0A05N697E3JC15ye9RjXq1XrhrXarZpsx23dXj2N1213dAV4CTIAlwASYAEuACTABlgATYAIsASbABFgCTIAJsASYABNgCTABJsASYAJMgCXANB243jR7G0+9d1cfY/XZXf0BFx7g3K4VeHxqdhyrr+dm04H3N80exmramQEEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEXA7wdGh2Gqv9S7Pd9X4J+L8A57Zab5t9j9m5uzqP1aG7+hnA7sHYjqemnZnX7uoIeAkwAZYAE2ACLAEmwARYAkyACbAEmAATYAkwASbAEmACTIAlwASYAEuACTABlgDTDODCA5zbLxcHeK53Gj6hAAAAAElFTkSuQmCC"></Image>
                <TSCode code={`pnpm i @brok/sdk`} lang="bash"></TSCode>
              </Row>
            </Container>
          </Grid>
          <Spacer y={5}></Spacer>
          <Grid xs={12} justify='center' >
            <Text h2>Join the movement. Build something.</Text>
          </Grid>
        </Grid.Container>

        <Spacer y={5}></Spacer>

        <Grid.Container>
          <Grid xs={12} sm={6} >
            <Container gap={2} style={{ maxWidth: "25rem" }} >
              <Text h3>Unconstrained innovation</Text>
              <Text >Data that is public by law is also public for anyone that wants to build. Access cap table data, balances, and some personal information with one line.</Text>
            </Container>
          </Grid>
          <Grid xs={12} sm={6} >
            <Container >

              <TSCode code={`
const capTable = await sdk.getCapTable(idnentifier);
// returns 
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
`} lang="typescript"></TSCode>
            </Container>
          </Grid>
        </Grid.Container>

        <Spacer y={5}></Spacer>

        <Grid.Container>
          <Grid xs={12} sm={6} >
            <Container gap={2} style={{ maxWidth: "25rem" }} >
              <Text h3>Publishing</Text>
              <Text>BRØK ecosystem makes data ownership for organizations easier and gives people transperency. Ownership of the cap table data is defined by the data agreements that have been established between the shareholders of a company, while personal data (e.g., email, address or phone number) is stored on Ceramic with data agreements that define how it can be shared, persisted with trusted third parties. Publishing is just simple.</Text>
            </Container>
          </Grid>
          <Grid xs={12} sm={6} >
            <Container >
              <TSCode code={`
  const indentifier = await sdk.createCapTable({
    name: "Hoved orginisasjonen AS",
    orgnr: "123 123 123",
    shareholders : [
      name: 'Fiske AS',
      organizationIdentifier: '123456789',
      organizationIdentifierType: 'EUID',
      amount: '500',
      countryCode: 'NO',
      postalcode: '05555',
      partition: 'ordinære',
    ],
  });
`} lang="typescript"></TSCode>
            </Container>
          </Grid>
        </Grid.Container>

        <Spacer y={5}></Spacer>

        <Grid.Container>
          <Grid xs={12} sm={6} >
            <Container gap={2} style={{ maxWidth: "25rem" }} >
              <Text h3>Transfer</Text>
              <Text>BRØK ecosystem makes data ownership for organizations easier and gives people transperency. Ownership of the cap table data is defined by the data agreements that have been established between the shareholders of a company, while personal data (e.g., email, address or phone number) is stored on Ceramic with data agreements that define how it can be shared, persisted with trusted third parties. Publishing is just simple.</Text>
            </Container>
          </Grid>
          <Grid xs={12} sm={6} >
            <Container >
              <TSCode code={`
  const indentifier = await sdk.createCapTable({
    name: "Hoved orginisasjonen AS",
    orgnr: "123 123 123",
    shareholders : [
      name: 'Fiske AS',
      organizationIdentifier: '123456789',
      organizationIdentifierType: 'EUID',
      amount: '500',
      countryCode: 'NO',
      postalcode: '05555',
      partition: 'ordinære',
    ],
  });
`} lang="typescript"></TSCode>
            </Container>
          </Grid>
        </Grid.Container>

        <Spacer y={5}></Spacer>

        <Grid.Container justify='center' >
          <Grid xs={12} sm={6} style={{ maxWidth: "25rem" }} justify='center'  >
            <Button as={"a"} target="_blank" href={"https://www.npmjs.com/package/@brok/sdk"}>NPM</Button>
          </Grid>
          <Grid xs={12} sm={6} style={{ maxWidth: "25rem" }} justify='center' >
            <Button onPress={() => router.push("/sdk-documentation")}>SDK documentation</Button>
          </Grid>
          <Spacer y={10}></Spacer>
          <Grid xs={12} justify='center' >
            <Text h2>Filing property records has never been more efficient, straightforward, or accessible.</Text>
          </Grid>
        </Grid.Container>

        <Spacer y={10}></Spacer>

      </Container>
    </div >
  )
}

export default Home
