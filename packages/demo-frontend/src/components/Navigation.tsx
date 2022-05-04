import { Box, Button, Header, Image, ResponsiveContext, Text } from 'grommet';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useBrok } from '../context/useBrok';
import BRREG_LOGO_SMALL_PNG from './../assets/images/brreg_logo.png';
import BRREG_LOGO_SVG from './../assets/images/brreg_logo.svg';

interface Props {}

export const Navigation: React.FC<Props> = () => {
  const { isLoggedIn, username, setUsername } = useBrok();
  const size = useContext(ResponsiveContext);
  const isTest = !process.env.REACT_APP_BROK_SERVER?.includes('prod');

  return (
    <Header background="brand-contrast" pad="small" height={{ min: '15vh' }}>
      <Box>
        <Link to="/">
          {size === 'small' ? (
            <Image src={BRREG_LOGO_SMALL_PNG} margin="small" height="37px"></Image>
          ) : (
            <Image src={BRREG_LOGO_SVG} margin="small" height="37px"></Image>
          )}
        </Link>
        <Text size="large" margin={{ left: '3em' }}>
          Aksjeeierbok
        </Text>
        {isTest && (
          <Box pad={'small'} background="yellow" margin={'small'}>
            <Text>Du er i testmodus.</Text>
          </Box>
        )}
      </Box>
      <Box direction="row" gap="small">
        {isLoggedIn ? (
          <Box direction="row" gap="medium">
            <Text>Du er logget inn som: {username}</Text>
            <Button size="small" label="Logg ut" onClick={() => setUsername('')} hoverIndicator focusIndicator={false} />
          </Box>
        ) : (
          <Link to="/login">
            <Button size="small" label="Logg inn" hoverIndicator focusIndicator={false} />
          </Link>
        )}
        <Link to="/register/list">
          <Button size="small" label="Aksjeregister" hoverIndicator focusIndicator={false} />
        </Link>
        {/*   <Link to="/me">
          <Button label={'Mine aksjer'} size="small" hoverIndicator focusIndicator={false}></Button>
        </Link> */}
      </Box>
    </Header>
  );
};
