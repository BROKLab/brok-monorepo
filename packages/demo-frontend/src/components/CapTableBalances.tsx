import { ShareholderCeramic } from '@brok/sdk';
import { CapTableGraphQLTypes } from '@brok/sdk/lib/ethereum/utils/CapTableGraphQL.utils';
import { Box, Button, DataTable, Text } from 'grommet';
import { Edit, Transaction } from 'grommet-icons';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useBrok } from '../context/useBrok';
import { EditShareholderModal } from './EditShareholderModal';
import { FormatEthereumAddress } from './FormatEthereumAddress';
import { TransferSharesModal } from './TransferSharesModal';
var debug = require('debug')('component:CapTableBalances');

type ShareholderWithPartitionBalance = ShareholderCeramic & CapTableGraphQLTypes.CapTableQuery.Balance;

interface Props {
  capTableAddress: string;
  name: string;
  boardDirectorName: string;
  balances: ShareholderWithPartitionBalance[];
}

export const CapTableBalances: React.FC<Props> = ({ ...props }) => {
  const [editEntity, setEditShareholder] = useState<ShareholderWithPartitionBalance>();
  const [transferShares, setTransferShares] = useState<ShareholderWithPartitionBalance>();
  const { updateShareholderCeramic } = useBrok();

  const toHoursMonthYear = (date: string) => {
    return new Date(date).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const roleDependendtColums = () => {
    return [
      // {
      //   property: 'address',
      //   header: <Text>ID</Text>,
      //   render: (data: ShareholderWithPartitionBalance) => <FormatEthereumAddress address={data.ethAddress}></FormatEthereumAddress>,
      // },
      {
        property: 'name',
        header: <Text>Navn</Text>,
        render: (data: ShareholderWithPartitionBalance) => data.name ?? 'Ukjent bruker',
      },
      {
        property: 'postcode',
        header: <Text>Postkode</Text>,
        render: (data: ShareholderWithPartitionBalance) => data.postalcode ?? '-',
      },
      {
        property: 'birthday',
        header: <Text>Født</Text>,
        render: (data: ShareholderWithPartitionBalance) => (!data.birthDate ? '-' : toHoursMonthYear(data.birthDate)),
      },
      {
        property: 'balance',
        header: <Text>Aksjer</Text>,
        render: (data: ShareholderWithPartitionBalance) => parseInt(data.amount),
      },
      {
        property: 'balanceByPartition',
        header: <Text>Aksjeklasser</Text>,
        render: (data: ShareholderWithPartitionBalance) => data.partition,
      },
      {
        property: 'virtual',
        header: '',
        render: (data: ShareholderWithPartitionBalance) => {
          return (
            <>
              <Box direction="row">
                <Button icon={<Edit></Edit>} onClick={() => setEditShareholder(data)} />
                <Button icon={<Transaction />} title="Overfør aksjer" onClick={() => setTransferShares(data)} />
              </Box>
            </>
          );
        },
      },
    ];
  };

  return (
    <Box gap="medium">
      {editEntity && (
        <EditShareholderModal
          capTableAddress={props.capTableAddress}
          updateShareholderData={{
            name: editEntity.name,
            countryCode: editEntity.countryCode,
            birthDate: editEntity.birthDate,
            postalcode: editEntity.postalcode,
            ethAddress: editEntity.ethAddress,
          }}
          onDismiss={() => setEditShareholder(undefined)}
          onFinished={() => setEditShareholder(undefined)}
        />
      )}
      {transferShares && (
        <TransferSharesModal
          capTableAddress={props.capTableAddress}
          from={transferShares.ethAddress}
          onConfirm={() => setTransferShares(undefined)}
          onDismiss={() => setTransferShares(undefined)}
        />
      )}

      {props.balances && <DataTable data={props.balances} primaryKey={false} columns={roleDependendtColums()}></DataTable>}
      {props.balances && <Box fill="horizontal" direction="row" margin="small" align="center" justify="between"></Box>}
    </Box>
  );
};
