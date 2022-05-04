import { Grommet, Box, Main, Footer, Paragraph, Text } from 'grommet';
import { Navigation } from './components/Navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { BrokProvider } from './context/useBrok';
import { Theme } from './assets/Theme';
import { Home } from './views/Home';
import { ClientContext, GraphQLClient } from 'graphql-hooks';
import { CapTableCreateView } from './views/CapTableCreateView';
import { LoginView } from './views/LoginView';
import { CapTableView } from './views/CapTableView';
import { CapTableRegistryPage } from './views/CapTableRegistryPage';

var debug = require('debug')('component:App');

function App() {
  if (!process.env.REACT_APP_BROK_CAPTABLE_GRAPHQL) {
    throw Error('Please set process.env.REACT_APP_BROK_CAPTABLE_GRAPHQL');
  }
  const client = new GraphQLClient({
    url: process.env.REACT_APP_BROK_CAPTABLE_GRAPHQL,
  });


  debug('App running 🚀');
  return (
    <Grommet theme={Theme} full={true}>
      <ClientContext.Provider value={client}>
        <BrokProvider>
          <BrowserRouter>
            <Box height={{ min: '100vh' }}>
              {/* Navigation */}
              <Navigation></Navigation>
              {/* Content swtich */}
              <Box pad="xlarge" height={{ min: '75vh' }}>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route path="/captable/create" component={CapTableCreateView} />
                  <Route path="/login" component={LoginView} />
                  <Route path="/capTable/:address" component={CapTableView} />
                  <Route path="/register" component={CapTableRegistryPage} />
                </Switch>
              </Box>

              {/* footer */}
              <Box background="brand" pad="medium" height={{ min: '10vh' }}>
                <Box align="center" justify="center" alignContent="center" fill="horizontal">
                  <Text textAlign="center" size="small">
                    <Paragraph>Brønnøysundregistrene Aksjeeierbok</Paragraph>
                    <Paragraph>Del av Brønnøysundregistrene Sandkasse</Paragraph>
                  </Text>
                </Box>
              </Box>
            </Box>
          </BrowserRouter>
        </BrokProvider>
        <ToastContainer></ToastContainer>
      </ClientContext.Provider>
    </Grommet>
  );
}

export default App;
