import { Box, Button, Heading, Paragraph, Text } from 'grommet';
import { Inspect, LinkNext, UserManager } from 'grommet-icons';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {}

export const Home: React.FC<Props> = () => {
  return (
    <>
      <Heading level={3}>
        Velkommen til{' '}
        <Text size="xxlarge" weight="bold" style={{ fontStyle: 'italic' }}>
          Brønnøysundregistrene Aksjeeierbok
        </Text>
      </Heading>
      <Box direction="row" margin={{ vertical: 'large' }}>
        {[
          {
            title: 'For selskapseiere',
            icon: <UserManager></UserManager>,
            description: 'Er du styreleder av et unotert aksjeselskap? Da kan flytte aksjeeierboken din til BRØK.',
            buttonText: 'Opprett aksjeeierbok',
            link: '/captable/create',
          },
          {
            title: 'Innsyn',
            icon: <Inspect />,
            description: 'Alle aksjeeierbøkene på BRØK er åpne. Her får du en liste over alle selskaper på plattformen.',
            buttonText: 'Aksjeeierbokregisteret',
            link: '/register/list',
          },
        ].map((homeAction, index) => {
          return (
            <Box
              key={index}
              direction="column"
              justify="between"
              style={{ minWidth: 300, maxWidth: 300 }}
              border={{ color: 'brand', size: 'medium' }}
              margin="small"
              pad="medium"
            >
              <Box direction="column">
                <Box direction="row" align="center" justify="around">
                  {homeAction.icon}
                  <Heading level={4}>{homeAction.title}</Heading>
                </Box>
                <Paragraph>{homeAction.description}</Paragraph>
              </Box>
              <Box direction="row" justify="end">
                <Link to={homeAction.link}>
                  <Button size="small" hoverIndicator focusIndicator={false}>
                    <Box border={{ size: 'small', color: 'brand' }} pad="small" direction="row" align="center" gap="small">
                      <Text color="black" size="small">
                        {homeAction.buttonText}
                      </Text>
                      <LinkNext size="small" />
                    </Box>
                  </Button>
                </Link>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};
