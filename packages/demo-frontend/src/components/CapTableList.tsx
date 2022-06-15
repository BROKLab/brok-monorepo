import { Button, DataTable, Text } from 'grommet';
import { More } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export type CapTable = {
  name: string;
  orgnr: string;
  status: string;
  id: string;
};

interface Props {
  capTables: CapTable[];
}

export const CapTableList: React.FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  return (
    <DataTable
      data={props.capTables}
      primaryKey={'address'}
      columns={[
        {
          property: 'uuid',
          header: <Text>Orgnr</Text>,
          render: (data) => data.orgnr,
        },
        {
          property: 'name',
          header: <Text truncate>Navn</Text>,
          render: (data) => data.name,
        },
        {
          property: 'status',
          header: <Text>Status</Text>,
          render: (data) => data.status,
        },
        {
          property: 'actions',
          header: <Text>...</Text>,
          render: (data) => (
            <Button
              size="small"
              hoverIndicator={true}
              focusIndicator={false}
              icon={<More></More>}
              onClick={() => navigate('/captable/' + data.id)}
            ></Button>
          ),
        },
      ]}
    />
  );
};
