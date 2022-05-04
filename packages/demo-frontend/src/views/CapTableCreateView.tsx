import React from 'react';
import { Box } from 'grommet';
import { CreateCapTableForm } from '../components/CreateCapTableForm';

interface Props {}

export const CapTableCreateView: React.FC<Props> = ({ ...props }) => {
  return (
    <Box>
      <CreateCapTableForm></CreateCapTableForm>
    </Box>
  );
};
