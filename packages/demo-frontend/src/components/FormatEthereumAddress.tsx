import Copy from 'clipboard-copy';
import { Box, Button, Text } from 'grommet';
import { Copy as CopyIcon } from 'grommet-icons';
import React, { useState } from 'react';

interface Props {
  address: string;
  copy?: boolean;
  size?: string;
}

export const FormatEthereumAddress: React.FC<Props> = ({ address, copy = true, size = 'medium' }) => {
  const [color, setColor] = useState<string>('black');
  if (!address) return null;

  // useEffect(() => {
  //   if (requestName) {
  //     requestName(address)
  //   }
  //   // Because we dont want to rerender when auth context changes on requestName
  //   // eslint-disable-next-line
  // }, [address])

  const formatAddress = () => {
    // const checkedAddress = ethers.utils.getAddress(address)
    // if (checkedAddress in names && "name" in names[checkedAddress]) {
    //   return names[checkedAddress].name
    // }
    return address.substr(0, 5) + '..' + address.substr(address.length - 2, address.length);
  };
  const handleCopy = () => {
    setColor('green');
    Copy(address);
    setTimeout(() => {
      setColor('text');
    }, 300);
  };

  return (
    <Box direction="row">
      <Text size={size}>{formatAddress()}</Text>
      {copy && (
        <Button
          plain
          margin={{ left: '5px' }}
          alignSelf="center"
          icon={<CopyIcon size="15px" color={color}></CopyIcon>}
          onClick={() => handleCopy()}
          hoverIndicator
          focusIndicator={false}
        ></Button>
      )}
    </Box>
  );
};
